// Help requests: a learner asks for help, a supervisor (or admin) replies.
const router = require('express').Router();
const db = require('../db');
const wrap = require('../util');
const { required, allow, notSupervisor } = require('../middleware/auth');

const isStaff = u => u.role === 'supervisor' || u.role === 'admin';
const clean = s => String(s || '').trim().slice(0, 1000);

async function messages(requestId) {
  const [rows] = await db.query(
    `SELECT m.id, m.body, m.created_at, m.sender_id, u.full_name sender_name, u.role sender_role
     FROM help_messages m LEFT JOIN users u ON u.id=m.sender_id WHERE m.request_id=? ORDER BY m.id`, [requestId]);
  return rows;
}

// Learner: ask for help
router.post('/help', required, notSupervisor, wrap(async (req, res) => {
  const body = clean(req.body.message);
  if (!body) return res.status(400).json({ error: 'Please write your question.' });
  const courseId = req.body.course_id ? Number(req.body.course_id) : null;
  const [ins] = await db.query('INSERT INTO help_requests (user_id, course_id) VALUES (?,?)', [req.user.id, courseId]);
  await db.query('INSERT INTO help_messages (request_id, sender_id, body) VALUES (?,?,?)', [ins.insertId, req.user.id, body]);
  res.json({ id: ins.insertId });
}));

// Learner: my requests with all messages
router.get('/help/mine', required, wrap(async (req, res) => {
  const [reqs] = await db.query(
    `SELECT r.id, r.status, r.created_at, r.updated_at, c.title_en, c.title_so
     FROM help_requests r LEFT JOIN courses c ON c.id=r.course_id WHERE r.user_id=? ORDER BY r.updated_at DESC`, [req.user.id]);
  for (const r of reqs) r.messages = await messages(r.id);
  res.json(reqs);
}));

// Staff: all requests (open first)
router.get('/help', required, allow('supervisor', 'admin'), wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.id, r.status, r.created_at, r.updated_at, r.user_id, u.full_name, u.identifier, c.title_en, c.title_so,
       (SELECT body FROM help_messages m WHERE m.request_id=r.id ORDER BY m.id DESC LIMIT 1) last_message,
       (SELECT COUNT(*) FROM help_messages m WHERE m.request_id=r.id) message_count
     FROM help_requests r JOIN users u ON u.id=r.user_id LEFT JOIN courses c ON c.id=r.course_id
     ORDER BY FIELD(r.status,'open','answered','closed'), r.updated_at DESC LIMIT 300`);
  res.json(rows);
}));

async function loadAllowed(req, res) {
  const [[r]] = await db.query(
    `SELECT r.*, u.full_name, u.identifier, c.title_en, c.title_so FROM help_requests r
     JOIN users u ON u.id=r.user_id LEFT JOIN courses c ON c.id=r.course_id WHERE r.id=?`, [req.params.id]);
  if (!r) { res.status(404).json({ error: 'Help request not found.' }); return null; }
  if (r.user_id !== req.user.id && !isStaff(req.user)) { res.status(403).json({ error: 'You do not have access to this.' }); return null; }
  return r;
}

router.get('/help/:id', required, wrap(async (req, res) => {
  const r = await loadAllowed(req, res); if (!r) return;
  r.messages = await messages(r.id);
  res.json(r);
}));

// Reply (learner or staff). A staff reply marks it 'answered'; a learner reply re-opens it.
router.post('/help/:id/messages', required, wrap(async (req, res) => {
  const r = await loadAllowed(req, res); if (!r) return;
  const body = clean(req.body.message);
  if (!body) return res.status(400).json({ error: 'Please write a message.' });
  await db.query('INSERT INTO help_messages (request_id, sender_id, body) VALUES (?,?,?)', [r.id, req.user.id, body]);
  const status = isStaff(req.user) && r.user_id !== req.user.id ? 'answered' : 'open';
  await db.query('UPDATE help_requests SET status=? WHERE id=?', [status, r.id]);
  res.json({ ok: true });
}));

router.patch('/help/:id', required, wrap(async (req, res) => {
  const r = await loadAllowed(req, res); if (!r) return;
  const status = req.body.status === 'closed' ? 'closed' : 'open';
  await db.query('UPDATE help_requests SET status=? WHERE id=?', [status, r.id]);
  res.json({ ok: true });
}));

module.exports = router;
