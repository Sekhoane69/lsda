// Learner data rights: see/download everything we hold, correct it, or delete the account.
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const wrap = require('../util');
const { required } = require('../middleware/auth');
const { streamDataReport } = require('../lib/dataReport');


// Everything stored about one user (shown on the My data page and put in the PDF)
async function collect(id) {
  const [[profile]] = await db.query(
    'SELECT full_name, identifier, role, gender, age_group, has_disability, language, consent_at, guardian_consent, created_at FROM users WHERE id=?', [id]);
  const [enrolments] = await db.query(
    'SELECT c.title_en, c.title_so, e.enrolled_at FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at', [id]);
  const [lessons] = await db.query(
    `SELECT c.title_en course_en, c.title_so course_so, l.title_en, l.title_so, p.completed_at FROM lesson_progress p
     JOIN lessons l ON l.id=p.lesson_id JOIN courses c ON c.id=l.course_id WHERE p.user_id=? ORDER BY p.completed_at`, [id]);
  const [quizzes] = await db.query(
    `SELECT c.title_en, c.title_so, a.kind, a.score, a.passed, a.created_at
     FROM quiz_attempts a JOIN courses c ON c.id=a.course_id WHERE a.user_id=? ORDER BY a.created_at`, [id]);
  const [certificates] = await db.query(
    `SELECT x.certificate_no, c.title_en, c.title_so, x.issued_at, x.status FROM certificates x JOIN courses c ON c.id=x.course_id WHERE x.user_id=?`, [id]);
  const [feedback] = await db.query('SELECT rating, usability_ok, comment, created_at FROM feedback WHERE user_id=?', [id]);
  const [help] = await db.query(
    `SELECT r.id request, r.status, m.body message, m.created_at, IF(m.sender_id=?, 'me', 'supervisor') sender
     FROM help_requests r JOIN help_messages m ON m.request_id=r.id WHERE r.user_id=? ORDER BY r.id, m.id`, [id, id]);
  return { exported_at: new Date().toISOString(), profile, enrolments, lessons, quizzes, certificates, feedback, help };
}

router.get('/my/data', required, wrap(async (req, res) => res.json(await collect(req.user.id))));

// The same information as a PDF file (?lang=so for Sesotho)
router.get('/my/data.pdf', required, wrap(async (req, res) => {
  const data = await collect(req.user.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="my-lsda-data.pdf"');
  streamDataReport(res, data, req.query.lang === 'so' ? 'so' : 'en');
}));

// Correct your own details
router.patch('/my/profile', required, wrap(async (req, res) => {
  const b = req.body;
  const full_name = String(b.full_name || '').trim();
  if (!full_name) return res.status(400).json({ error: 'Full name is required.' });
  const pickEnum = (v, list, dflt) => (list.includes(v) ? v : dflt);
  await db.query('UPDATE users SET full_name=?, gender=?, age_group=?, has_disability=?, language=? WHERE id=?', [
    full_name,
    pickEnum(b.gender, ['female', 'male', 'other', 'undisclosed'], 'undisclosed'),
    pickEnum(b.age_group, ['under18', '18-35', '36-60', 'over60'], null),
    pickEnum(b.has_disability, ['yes', 'no', 'undisclosed'], 'undisclosed'),
    b.language === 'so' ? 'so' : 'en',
    req.user.id]);
  res.json({ ok: true });
}));

// Withdraw consent and delete the account and ALL learning records (cannot be undone)
router.delete('/my/account', required, wrap(async (req, res) => {
  const [[u]] = await db.query('SELECT id, role, password_hash FROM users WHERE id=?', [req.user.id]);
  if (!(await bcrypt.compare(String(req.body.password || ''), u.password_hash)))
    return res.status(401).json({ error: 'Wrong password. Your account was not deleted.' });
  if (u.role === 'admin') {
    const [[a]] = await db.query("SELECT COUNT(*) n FROM users WHERE role='admin'");
    if (a.n <= 1) return res.status(400).json({ error: 'You are the only admin. Make someone else an admin first.' });
  }
  // Enrolments, progress, quiz results, certificates, feedback and help requests are removed by ON DELETE CASCADE.
  await db.query('DELETE FROM users WHERE id=?', [u.id]);
  res.json({ ok: true });
}));

module.exports = router;
