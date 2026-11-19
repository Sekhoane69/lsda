const router = require('express').Router();
const db = require('../db');
const wrap = require('../util');
const { required, notSupervisor } = require('../middleware/auth');
const { streamCertificate } = require('../lib/pdf');

router.get('/certificates/mine', required, notSupervisor, wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT x.certificate_no, x.issued_at, x.status, c.title_en, c.title_so
     FROM certificates x JOIN courses c ON c.id=x.course_id WHERE x.user_id=? ORDER BY x.issued_at DESC`, [req.user.id]);
  res.json(rows);
}));

// Public verification. Shows only a masked name so private details are not exposed.
router.get('/certificates/verify/:no', wrap(async (req, res) => {
  const [[row]] = await db.query(
    `SELECT x.certificate_no, x.issued_at, x.status, c.title_en, u.full_name
     FROM certificates x JOIN courses c ON c.id=x.course_id JOIN users u ON u.id=x.user_id
     WHERE x.certificate_no=?`, [req.params.no.trim().toUpperCase()]);
  if (!row) return res.json({ found: false });
  const parts = row.full_name.trim().split(/\s+/);
  const masked = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
  res.json({ found: true, certificate_no: row.certificate_no, name: masked, course: row.title_en, issued_at: row.issued_at, status: row.status });
}));

router.get('/certificates/:no/pdf', required, wrap(async (req, res) => {
  const [[row]] = await db.query(
    `SELECT x.*, c.title_en, u.full_name FROM certificates x
     JOIN courses c ON c.id=x.course_id JOIN users u ON u.id=x.user_id WHERE x.certificate_no=?`, [req.params.no]);
  if (!row) return res.status(404).json({ error: 'Certificate not found.' });
  if (row.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'This is not your certificate.' });
  if (row.status !== 'valid') return res.status(403).json({ error: 'This certificate has been revoked.' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${row.certificate_no}.pdf"`);
  const date = new Date(row.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  await streamCertificate(res, { name: row.full_name, course: row.title_en, date, no: row.certificate_no });
}));

module.exports = router;
