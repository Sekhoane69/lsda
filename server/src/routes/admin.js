// Admin only: users and roles, certificates, and course content (English + Sesotho).
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const wrap = require('../util');
const { required, allow } = require('../middleware/auth');

router.use(required, allow('admin'));

const ROLES = ['learner', 'supervisor', 'admin'];
const orNull = v => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());

// ---- Users ----
router.get('/users', wrap(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, full_name, identifier, role, gender, age_group, created_at FROM users ORDER BY id DESC LIMIT 500');
  res.json(rows);
}));

router.patch('/users/:id/role', wrap(async (req, res) => {
  if (!ROLES.includes(req.body.role)) return res.status(400).json({ error: 'Invalid role.' });
  if (Number(req.params.id) === req.user.id && req.body.role !== 'admin')
    return res.status(400).json({ error: 'You cannot remove your own admin role.' });
  await db.query('UPDATE users SET role=? WHERE id=?', [req.body.role, req.params.id]);
  res.json({ ok: true });
}));

// For learners who forget their password: the admin sets a temporary one and tells them in person
router.post('/users/:id/password', wrap(async (req, res) => {
  const pw = String(req.body.password || '');
  if (pw.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  await db.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(pw, 10), req.params.id]);
  await db.query('UPDATE password_reset_requests SET resolved_at=NOW(), resolved_by=? WHERE user_id=? AND resolved_at IS NULL', [req.user.id, req.params.id]);
  res.json({ ok: true });
}));

// Deletes a user and all their records (for a learner who asks in person or by phone)
router.delete('/users/:id', wrap(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Use My data to delete your own account.' });
  await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

// ---- Certificates ----
router.get('/certificates', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT x.certificate_no, x.status, x.issued_at, u.full_name, c.title_en
     FROM certificates x JOIN users u ON u.id=x.user_id JOIN courses c ON c.id=x.course_id ORDER BY x.id DESC LIMIT 500`);
  res.json(rows);
}));

router.post('/certificates/:no/revoke', wrap(async (req, res) => {
  await db.query("UPDATE certificates SET status='revoked' WHERE certificate_no=?", [req.params.no]);
  res.json({ ok: true });
}));

// ---- Content ----
// All courses, including hidden ones (the public /courses list shows only visible courses)
router.get('/courses', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT id, module_no, title_en, title_so, published FROM courses ORDER BY module_no');
  res.json(rows);
}));

// Full course content for editing (includes correct answers, so admin only)
router.get('/content/:courseId', wrap(async (req, res) => {
  const [[course]] = await db.query('SELECT * FROM courses WHERE id=?', [req.params.courseId]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  const [lessons] = await db.query('SELECT * FROM lessons WHERE course_id=? ORDER BY position', [course.id]);
  const [questions] = await db.query(
    'SELECT q.* FROM questions q JOIN quizzes z ON z.id=q.quiz_id WHERE z.course_id=? ORDER BY q.qset, q.id', [course.id]);
  res.json({ course, lessons, questions });
}));

router.post('/courses', wrap(async (req, res) => {
  const b = req.body;
  if (!orNull(b.title_en) || !orNull(b.description_en)) return res.status(400).json({ error: 'English title and description are required.' });
  const [[m]] = await db.query('SELECT COALESCE(MAX(module_no),0)+1 n FROM courses');
  const [ins] = await db.query(
    'INSERT INTO courses (module_no, title_en, title_so, description_en, description_so) VALUES (?,?,?,?,?)',
    [m.n, b.title_en.trim(), orNull(b.title_so), b.description_en.trim(), orNull(b.description_so)]);
  await db.query('INSERT INTO quizzes (course_id, pass_mark) VALUES (?,70)', [ins.insertId]);
  res.json({ id: ins.insertId });
}));

router.put('/courses/:id', wrap(async (req, res) => {
  const b = req.body;
  if (!orNull(b.title_en) || !orNull(b.description_en)) return res.status(400).json({ error: 'English title and description are required.' });
  await db.query('UPDATE courses SET title_en=?, title_so=?, description_en=?, description_so=?, published=? WHERE id=?',
    [b.title_en.trim(), orNull(b.title_so), b.description_en.trim(), orNull(b.description_so), b.published === false || b.published === 0 ? 0 : 1, req.params.id]);
  res.json({ ok: true });
}));

router.post('/lessons', wrap(async (req, res) => {
  const b = req.body;
  if (!b.course_id || !orNull(b.title_en) || !orNull(b.body_en)) return res.status(400).json({ error: 'Course, English title and lesson text are required.' });
  const [[p]] = await db.query('SELECT COALESCE(MAX(position),0)+1 n FROM lessons WHERE course_id=?', [b.course_id]);
  const [ins] = await db.query(
    'INSERT INTO lessons (course_id, position, title_en, title_so, body_en, body_so, video_url) VALUES (?,?,?,?,?,?,?)',
    [b.course_id, p.n, b.title_en.trim(), orNull(b.title_so), b.body_en, orNull(b.body_so), orNull(b.video_url)]);
  res.json({ id: ins.insertId });
}));

router.put('/lessons/:id', wrap(async (req, res) => {
  const b = req.body;
  if (!orNull(b.title_en) || !orNull(b.body_en)) return res.status(400).json({ error: 'English title and lesson text are required.' });
  await db.query('UPDATE lessons SET title_en=?, title_so=?, body_en=?, body_so=?, video_url=? WHERE id=?',
    [b.title_en.trim(), orNull(b.title_so), b.body_en, orNull(b.body_so), orNull(b.video_url), req.params.id]);
  res.json({ ok: true });
}));

router.delete('/lessons/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM lessons WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

function checkQuestion(b) {
  const en = (b.options_en || []).map(s => String(s).trim());
  const so = (b.options_so || []).map(s => String(s).trim());
  // Keep only option rows that have English text; Sesotho options must line up with the English ones
  const keep = en.map((s, i) => (s ? i : -1)).filter(i => i >= 0);
  const opts_en = keep.map(i => en[i]);
  const opts_so = keep.map(i => so[i] || '');
  if (!orNull(b.text_en) || opts_en.length < 2) return { error: 'An English question and at least two English options are required.' };
  const idx = keep.indexOf(Number(b.correct_index));
  if (idx < 0) return { error: 'Choose which option is correct.' };
  const anySo = opts_so.some(Boolean);
  if (anySo && !opts_so.every(Boolean)) return { error: 'Fill in the Sesotho for every option, or leave all Sesotho options empty.' };
  return {
    qset: b.qset === 'pre' ? 'pre' : 'post',
    text_en: b.text_en.trim(), text_so: orNull(b.text_so),
    options_en: JSON.stringify(opts_en), options_so: anySo ? JSON.stringify(opts_so) : null, correct_index: idx
  };
}

router.post('/questions', wrap(async (req, res) => {
  const q = checkQuestion(req.body);
  if (q.error) return res.status(400).json({ error: q.error });
  const [[quiz]] = await db.query('SELECT id FROM quizzes WHERE course_id=?', [req.body.course_id]);
  if (!quiz) return res.status(404).json({ error: 'Course not found.' });
  await db.query('INSERT INTO questions (quiz_id, qset, text_en, text_so, options_en, options_so, correct_index) VALUES (?,?,?,?,?,?,?)',
    [quiz.id, q.qset, q.text_en, q.text_so, q.options_en, q.options_so, q.correct_index]);
  res.json({ ok: true });
}));

router.put('/questions/:id', wrap(async (req, res) => {
  const q = checkQuestion(req.body);
  if (q.error) return res.status(400).json({ error: q.error });
  await db.query('UPDATE questions SET qset=?, text_en=?, text_so=?, options_en=?, options_so=?, correct_index=? WHERE id=?',
    [q.qset, q.text_en, q.text_so, q.options_en, q.options_so, q.correct_index, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/questions/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM questions WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
