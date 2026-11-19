const router = require('express').Router();
const db = require('../db');
const wrap = require('../util');
const { optional, required, notSupervisor } = require('../middleware/auth');
const { issueCertificate } = require('../lib/certs');

// All published courses (with the learner's progress if logged in)
router.get('/courses', optional, wrap(async (req, res) => {
  const [courses] = await db.query(
    `SELECT c.*, (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) AS lesson_count
     FROM courses c WHERE c.published=1 ORDER BY c.module_no`);
  if (req.user) {
    const [done] = await db.query(
      `SELECT l.course_id, COUNT(*) n FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id
       WHERE p.user_id=? GROUP BY l.course_id`, [req.user.id]);
    const [enr] = await db.query('SELECT course_id FROM enrollments WHERE user_id=?', [req.user.id]);
    const [certs] = await db.query("SELECT course_id FROM certificates WHERE user_id=? AND status='valid'", [req.user.id]);
    courses.forEach(c => {
      c.completed_lessons = (done.find(d => d.course_id === c.id) || {}).n || 0;
      c.enrolled = enr.some(e => e.course_id === c.id);
      c.certified = certs.some(e => e.course_id === c.id);
    });
  }
  res.json(courses);
}));

router.get('/courses/:id', optional, wrap(async (req, res) => {
  const [[course]] = await db.query('SELECT * FROM courses WHERE id=? AND published=1', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  const [lessons] = await db.query('SELECT id, position, title_en, title_so FROM lessons WHERE course_id=? ORDER BY position', [course.id]);
  const out = { ...course, lessons, completed: [], enrolled: false, certificate: null };
  if (req.user) {
    const [p] = await db.query(
      `SELECT p.lesson_id FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=?`,
      [req.user.id, course.id]);
    out.completed = p.map(x => x.lesson_id);
    const [e] = await db.query('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [req.user.id, course.id]);
    out.enrolled = e.length > 0;
    const [c] = await db.query("SELECT certificate_no FROM certificates WHERE user_id=? AND course_id=? AND status='valid'", [req.user.id, course.id]);
    out.certificate = c[0] ? c[0].certificate_no : null;
    const [pre] = await db.query("SELECT score FROM quiz_attempts WHERE user_id=? AND course_id=? AND kind='pre' ORDER BY id LIMIT 1", [req.user.id, course.id]);
    out.pre_score = pre[0] ? pre[0].score : null;
    const st = await quizState(req.user.id, course.id);
    out.pre_locked = st.pre_locked;
    out.post_open = st.post_open;
  }
  res.json(out);
}));

router.post('/courses/:id/enroll', required, notSupervisor, wrap(async (req, res) => {
  await db.query('INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?,?)', [req.user.id, req.params.id]);
  res.json({ ok: true });
}));

router.get('/lessons/:id', required, wrap(async (req, res) => {
  const [[lesson]] = await db.query('SELECT * FROM lessons WHERE id=?', [req.params.id]);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  const [[prev]] = await db.query('SELECT id FROM lessons WHERE course_id=? AND position<? ORDER BY position DESC LIMIT 1', [lesson.course_id, lesson.position]);
  const [[next]] = await db.query('SELECT id FROM lessons WHERE course_id=? AND position>? ORDER BY position LIMIT 1', [lesson.course_id, lesson.position]);
  const [done] = await db.query('SELECT id FROM lesson_progress WHERE user_id=? AND lesson_id=?', [req.user.id, lesson.id]);
  res.json({ ...lesson, prev_id: prev ? prev.id : null, next_id: next ? next.id : null, completed: done.length > 0 });
}));

router.post('/lessons/:id/complete', required, notSupervisor, wrap(async (req, res) => {
  const [[lesson]] = await db.query('SELECT course_id FROM lessons WHERE id=?', [req.params.id]);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  await db.query('INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?,?)', [req.user.id, lesson.course_id]);
  await db.query('INSERT IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?,?)', [req.user.id, req.params.id]);
  res.json({ ok: true });
}));

// Where a learner stands for the two quizzes in one course.
// Starter quiz (baseline): ONE attempt only, and only BEFORE the first lesson is completed.
// Final assessment: only after every lesson is completed.
async function quizState(userId, courseId) {
  const [[t]] = await db.query('SELECT COUNT(*) n FROM lessons WHERE course_id=?', [courseId]);
  const [[d]] = await db.query(
    'SELECT COUNT(*) n FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=?',
    [userId, courseId]);
  const [[pre]] = await db.query("SELECT COUNT(*) n FROM quiz_attempts WHERE user_id=? AND course_id=? AND kind='pre'", [userId, courseId]);
  const [[post]] = await db.query("SELECT COUNT(*) n FROM quiz_attempts WHERE user_id=? AND course_id=? AND kind='post'", [userId, courseId]);
  let pre_locked = null;                       // why the starter quiz cannot be taken (null = it can)
  if (pre.n > 0) pre_locked = 'done';
  else if (d.n > 0 || post.n > 0) pre_locked = 'started';
  return { lessons_total: t.n, lessons_done: d.n, pre_locked, post_open: t.n > 0 && d.n >= t.n };
}

function quizBlocked(kind, st) {
  if (kind === 'pre' && st.pre_locked === 'done') return 'You have already taken the starter quiz for this course. It can only be taken once.';
  if (kind === 'pre' && st.pre_locked === 'started') return 'The starter quiz can only be taken before you start the lessons.';
  if (kind === 'post' && !st.post_open) return 'Finish all lessons before taking the final assessment.';
  return null;
}

// Quiz questions (never send the correct answers to the browser).
// The starter quiz and the final assessment use DIFFERENT question sets (questions.qset).
router.get('/courses/:id/quiz', required, notSupervisor, wrap(async (req, res) => {
  const kind = req.query.kind === 'pre' ? 'pre' : 'post';
  const blocked = quizBlocked(kind, await quizState(req.user.id, req.params.id));
  if (blocked) return res.status(403).json({ error: blocked });
  const [[quiz]] = await db.query('SELECT * FROM quizzes WHERE course_id=?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'This course has no assessment yet.' });
  const [questions] = await db.query(
    'SELECT id, text_en, text_so, options_en, options_so FROM questions WHERE quiz_id=? AND qset=? ORDER BY id', [quiz.id, kind]);
  if (!questions.length) return res.status(404).json({ error: 'This quiz has no questions yet.' });
  res.json({ kind, pass_mark: quiz.pass_mark, questions });
}));

router.post('/courses/:id/quiz/submit', required, notSupervisor, wrap(async (req, res) => {
  const kind = req.body.kind === 'pre' ? 'pre' : 'post';
  const blocked = quizBlocked(kind, await quizState(req.user.id, req.params.id));
  if (blocked) return res.status(403).json({ error: blocked });
  const answers = req.body.answers || {};
  const [[quiz]] = await db.query('SELECT * FROM quizzes WHERE course_id=?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'This course has no assessment yet.' });
  const [qs] = await db.query('SELECT id, correct_index FROM questions WHERE quiz_id=? AND qset=?', [quiz.id, kind]);
  if (!qs.length) return res.status(400).json({ error: 'This quiz has no questions yet.' });

  const correct = qs.filter(q => Number(answers[q.id]) === q.correct_index).length;
  const score = Math.round((correct / qs.length) * 100);
  const passed = kind === 'post' && score >= quiz.pass_mark;

  await db.query('INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?,?)', [req.user.id, req.params.id]);
  await db.query('INSERT INTO quiz_attempts (user_id, course_id, kind, score, passed) VALUES (?,?,?,?,?)',
    [req.user.id, req.params.id, kind, score, passed ? 1 : 0]);

  let certificate = null;
  if (passed) certificate = await issueCertificate(req.user.id, req.params.id);
  res.json({ kind, score, correct, total: qs.length, pass_mark: quiz.pass_mark, passed, certificate_no: certificate ? certificate.certificate_no : null });
}));

router.get('/my/dashboard', required, notSupervisor, wrap(async (req, res) => {
  const [courses] = await db.query(
    `SELECT c.id, c.title_en, c.title_so, c.module_no,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) total,
       (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=c.id) done,
       (SELECT certificate_no FROM certificates x WHERE x.user_id=? AND x.course_id=c.id AND x.status='valid') certificate_no,
       (SELECT score FROM quiz_attempts a WHERE a.user_id=? AND a.course_id=c.id AND a.kind='pre' ORDER BY a.id LIMIT 1) pre_score,
       (SELECT MAX(score) FROM quiz_attempts a WHERE a.user_id=? AND a.course_id=c.id AND a.kind='post') post_score
     FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC`,
    [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
  res.json({ courses });
}));

router.post('/feedback', required, notSupervisor, wrap(async (req, res) => {
  const rating = Math.min(5, Math.max(1, Number(req.body.rating) || 0));
  if (!req.body.rating) return res.status(400).json({ error: 'Please choose a rating.' });
  await db.query('INSERT INTO feedback (user_id, course_id, rating, usability_ok, comment) VALUES (?,?,?,?,?)',
    [req.user.id, req.body.course_id || null, rating, req.body.usability_ok ? 1 : 0, (req.body.comment || '').slice(0, 1000)]);
  res.json({ ok: true });
}));

module.exports = router;
