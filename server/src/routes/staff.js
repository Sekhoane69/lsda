// Supervisor (and admin) views: M&E indicators, learner progress, anonymised data export.
const router = require('express').Router();
const db = require('../db');
const wrap = require('../util');
const bcrypt = require('bcryptjs');
const { required, allow } = require('../middleware/auth');

router.use(required, allow('supervisor', 'admin'));

// Starter score, FIRST final score and best final score for every learner + course.
// The M&E skills gain uses the FIRST final attempt so that retakes do not inflate it.
async function scoreTable() {
  const [attempts] = await db.query('SELECT user_id, course_id, kind, score FROM quiz_attempts ORDER BY id');
  const t = {};
  for (const a of attempts) {
    const k = a.user_id + '-' + a.course_id;
    const row = t[k] || (t[k] = { pre: null, first_post: null, best_post: null, post_attempts: 0 });
    if (a.kind === 'pre' && row.pre === null) row.pre = a.score;
    if (a.kind === 'post') {
      if (row.first_post === null) row.first_post = a.score;
      row.best_post = Math.max(row.best_post ?? 0, a.score);
      row.post_attempts++;
    }
  }
  return t;
}

router.get('/stats', wrap(async (req, res) => {
  const [[u]] = await db.query(
    `SELECT COUNT(*) n, SUM(gender='female') female, SUM(gender<>'undisclosed') gender_known,
            SUM(age_group IN ('under18','18-35')) youth, SUM(has_disability='yes') disability
     FROM users WHERE role='learner'`);
  const [[e]] = await db.query("SELECT COUNT(*) n FROM enrollments e JOIN users u ON u.id=e.user_id WHERE u.role='learner'");
  const [[c]] = await db.query("SELECT COUNT(*) n FROM certificates x JOIN users u ON u.id=x.user_id WHERE x.status='valid' AND u.role='learner'");
  const [[fb]] = await db.query('SELECT COUNT(*) n, AVG(usability_ok)*100 usability, AVG(rating) rating FROM feedback');
  const [[h]] = await db.query("SELECT SUM(status='open') open_n, COUNT(*) n FROM help_requests");
  const [learnerIds] = await db.query("SELECT id FROM users WHERE role='learner'");
  const isLearner = new Set(learnerIds.map(r => r.id));

  const table = await scoreTable();
  const rows = Object.entries(table).filter(([k]) => isLearner.has(Number(k.split('-')[0]))).map(([, v]) => v);
  const pairs = rows.filter(r => r.pre !== null && r.first_post !== null);
  const gain = pairs.length ? pairs.reduce((s, r) => s + (r.first_post - r.pre), 0) / pairs.length : null;
  const withBaseline = rows.filter(r => r.pre !== null).length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);

  res.json({
    registered: u.n,
    enrolments: e.n,
    certificates: c.n,
    female_pct: pct(Number(u.female), Number(u.gender_known)),
    youth_pct: pct(Number(u.youth), u.n),
    disability_count: Number(u.disability) || 0,
    completion_pct: pct(c.n, e.n),
    baseline_pct: pct(withBaseline, e.n),                 // share of enrolments that have a starter-quiz baseline
    usability_pct: fb.usability === null ? null : Math.round(fb.usability),
    avg_rating: fb.rating === null ? null : Number(Number(fb.rating).toFixed(1)),
    feedback_count: fb.n,
    skills_gain_points: gain === null ? null : Math.round(gain),
    skills_gain_sample: pairs.length,
    help_open: Number(h.open_n) || 0,
    help_total: h.n
  });
}));

// One row per learner: overall progress
router.get('/learners', wrap(async (req, res) => {
  const [learners] = await db.query(
    `SELECT u.id, u.full_name, u.identifier, u.gender, u.age_group, u.created_at,
       (SELECT COUNT(*) FROM enrollments e WHERE e.user_id=u.id) courses,
       (SELECT COUNT(*) FROM lesson_progress p WHERE p.user_id=u.id) lessons_done,
       (SELECT COUNT(*) FROM enrollments e JOIN lessons l ON l.course_id=e.course_id WHERE e.user_id=u.id) lessons_total,
       (SELECT COUNT(*) FROM certificates x WHERE x.user_id=u.id AND x.status='valid') certificates,
       (SELECT COUNT(*) FROM help_requests r WHERE r.user_id=u.id AND r.status='open') help_open,
       GREATEST(u.created_at,
         COALESCE((SELECT MAX(completed_at) FROM lesson_progress p WHERE p.user_id=u.id), u.created_at),
         COALESCE((SELECT MAX(created_at) FROM quiz_attempts a WHERE a.user_id=u.id), u.created_at)) last_active
     FROM users u WHERE u.role='learner' ORDER BY last_active DESC`);
  const table = await scoreTable();
  for (const l of learners) {
    const mine = Object.entries(table).filter(([k]) => k.startsWith(l.id + '-')).map(([, v]) => v);
    const avg = arr => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
    l.avg_pre = avg(mine.filter(r => r.pre !== null).map(r => r.pre));
    l.avg_first_post = avg(mine.filter(r => r.first_post !== null).map(r => r.first_post));
  }
  res.json(learners);
}));

// One learner in detail
router.get('/learners/:id', wrap(async (req, res) => {
  const [[u]] = await db.query(
    "SELECT id, full_name, identifier, gender, age_group, has_disability, language, created_at FROM users WHERE id=? AND role='learner'",
    [req.params.id]);
  if (!u) return res.status(404).json({ error: 'Learner not found.' });
  const [courses] = await db.query(
    `SELECT c.id, c.title_en, c.title_so, e.enrolled_at,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) total,
       (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=e.user_id AND l.course_id=c.id) done,
       (SELECT MAX(p.completed_at) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=e.user_id AND l.course_id=c.id) last_lesson_at,
       (SELECT certificate_no FROM certificates x WHERE x.user_id=e.user_id AND x.course_id=c.id AND x.status='valid') certificate_no
     FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at`, [u.id]);
  const table = await scoreTable();
  courses.forEach(c => Object.assign(c, table[u.id + '-' + c.id] || { pre: null, first_post: null, best_post: null, post_attempts: 0 }));
  const [help] = await db.query('SELECT id, status, updated_at FROM help_requests WHERE user_id=? ORDER BY updated_at DESC', [u.id]);
  res.json({ ...u, courses, help });
}));

// Anonymised CSV for the M&E report: learner codes instead of names, no contact details.
router.get('/export.csv', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id uid, u.gender, u.age_group, u.has_disability, c.id cid, c.title_en course,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) lessons_total,
       (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=u.id AND l.course_id=c.id) lessons_done,
       EXISTS(SELECT 1 FROM certificates x WHERE x.user_id=u.id AND x.course_id=c.id AND x.status='valid') certified
     FROM enrollments e JOIN users u ON u.id=e.user_id JOIN courses c ON c.id=e.course_id
     WHERE u.role='learner' ORDER BY u.id, c.id`);
  const table = await scoreTable();
  const codes = {}; let next = 1;
  const head = ['learner_code', 'gender', 'age_group', 'disability', 'course', 'lessons_done', 'lessons_total',
    'starter_score', 'first_final_score', 'best_final_score', 'final_attempts', 'certified'];
  const q = v => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = [head.join(',')];
  for (const r of rows) {
    codes[r.uid] = codes[r.uid] || 'L' + String(next++).padStart(3, '0');
    const s = table[r.uid + '-' + r.cid] || {};
    lines.push([codes[r.uid], r.gender, r.age_group, r.has_disability, r.course, r.lessons_done, r.lessons_total,
      s.pre, s.first_post, s.best_post, s.post_attempts || 0, r.certified ? 'yes' : 'no'].map(q).join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="lsda-me-data.csv"');
  res.send('﻿' + lines.join('\n'));
}));


// ---------- Course monitoring ----------
const avg = arr => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

async function enrolmentRows(courseId = null) {
  const [rows] = await db.query(
    `SELECT e.user_id, u.full_name, u.identifier, u.gender, u.age_group, e.course_id, c.title_en, c.title_so, e.enrolled_at,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) total,
       (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=e.user_id AND l.course_id=c.id) done,
       (SELECT MAX(p.completed_at) FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=e.user_id AND l.course_id=c.id) last_lesson_at,
       (SELECT certificate_no FROM certificates x WHERE x.user_id=e.user_id AND x.course_id=c.id AND x.status='valid') certificate_no
     FROM enrollments e JOIN users u ON u.id=e.user_id JOIN courses c ON c.id=e.course_id
     WHERE u.role='learner' ${courseId ? 'AND c.id=?' : ''} ORDER BY e.enrolled_at DESC`, courseId ? [courseId] : []);
  const table = await scoreTable();
  for (const r of rows) {
    Object.assign(r, table[r.user_id + '-' + r.course_id] || { pre: null, first_post: null, best_post: null, post_attempts: 0 });
    r.status = r.certificate_no ? 'certified' : r.total && r.done >= r.total ? 'lessons_done' : r.done > 0 || r.pre !== null ? 'in_progress' : 'not_started';
    r.gain = r.pre !== null && r.first_post !== null ? r.first_post - r.pre : null;
  }
  return rows;
}

router.get('/courses', wrap(async (req, res) => {
  const [courses] = await db.query(
    `SELECT c.id, c.module_no, c.title_en, c.title_so, c.published,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) lessons,
       (SELECT COUNT(*) FROM help_requests r WHERE r.course_id=c.id AND r.status='open') help_open
     FROM courses c ORDER BY c.module_no`);
  const rows = await enrolmentRows();
  for (const c of courses) {
    const mine = rows.filter(r => r.course_id === c.id);
    c.enrolled = mine.length;
    c.in_progress = mine.filter(r => r.status === 'in_progress').length;
    c.certified = mine.filter(r => r.status === 'certified').length;
    c.completion_pct = mine.length ? Math.round((c.certified / mine.length) * 100) : null;
    c.avg_pre = avg(mine.filter(r => r.pre !== null).map(r => r.pre));
    c.avg_first_post = avg(mine.filter(r => r.first_post !== null).map(r => r.first_post));
    c.avg_gain = avg(mine.filter(r => r.gain !== null).map(r => r.gain));
  }
  res.json(courses);
}));

router.get('/courses/:id', wrap(async (req, res) => {
  const [[course]] = await db.query('SELECT id, module_no, title_en, title_so, published FROM courses WHERE id=?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  // How many learners finished each lesson: shows where learners stop
  const [lessons] = await db.query(
    `SELECT l.id, l.position, l.title_en, l.title_so,
       (SELECT COUNT(*) FROM lesson_progress p JOIN users u ON u.id=p.user_id WHERE p.lesson_id=l.id AND u.role='learner') completed
     FROM lessons l WHERE l.course_id=? ORDER BY l.position`, [course.id]);
  const learners = await enrolmentRows(course.id);
  const [help] = await db.query(
    `SELECT r.id, r.status, r.updated_at, u.full_name FROM help_requests r JOIN users u ON u.id=r.user_id
     WHERE r.course_id=? ORDER BY FIELD(r.status,'open','answered','closed'), r.updated_at DESC`, [course.id]);
  res.json({ course, lessons, learners, help });
}));

// ---------- The records behind each M&E indicator ----------
router.get('/kpi/:key', wrap(async (req, res) => {
  const key = req.params.key;
  const learnerCols = 'u.id user_id, u.full_name, u.identifier, u.gender, u.age_group, u.has_disability, u.created_at';
  const learners = async where => (await db.query(`SELECT ${learnerCols} FROM users u WHERE u.role='learner' ${where} ORDER BY u.created_at DESC`))[0];
  let rows;
  switch (key) {
    case 'registered': rows = await learners(''); break;
    case 'female': rows = await learners("AND u.gender='female'"); break;
    case 'youth': rows = await learners("AND u.age_group IN ('under18','18-35')"); break;
    case 'disability': rows = await learners("AND u.has_disability='yes'"); break;
    case 'enrolments': case 'completion': case 'baseline': rows = await enrolmentRows(); break;
    case 'gain': rows = (await enrolmentRows()).filter(r => r.gain !== null); break;
    case 'certificates':
      [rows] = await db.query(
        `SELECT x.certificate_no, x.issued_at, x.user_id, u.full_name, c.title_en, c.title_so FROM certificates x
         JOIN users u ON u.id=x.user_id JOIN courses c ON c.id=x.course_id
         WHERE x.status='valid' AND u.role='learner' ORDER BY x.issued_at DESC`); break;
    case 'usability': case 'rating':
      [rows] = await db.query(
        `SELECT f.user_id, u.full_name, c.title_en, c.title_so, f.rating, f.usability_ok, f.comment, f.created_at FROM feedback f
         JOIN users u ON u.id=f.user_id LEFT JOIN courses c ON c.id=f.course_id ORDER BY f.created_at DESC`); break;
    case 'help':
      [rows] = await db.query(
        `SELECT r.id, r.user_id, u.full_name, c.title_en, c.title_so, r.updated_at,
           (SELECT body FROM help_messages m WHERE m.request_id=r.id ORDER BY m.id DESC LIMIT 1) last_message
         FROM help_requests r JOIN users u ON u.id=r.user_id LEFT JOIN courses c ON c.id=r.course_id
         WHERE r.status='open' ORDER BY r.updated_at`); break;
    default: return res.status(404).json({ error: 'Unknown indicator.' });
  }
  res.json({ key, rows });
}));

// ---------- Forgot-password requests ----------
router.get('/password-requests', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.id, r.created_at, u.id user_id, u.full_name, u.identifier, u.role FROM password_reset_requests r
     JOIN users u ON u.id=r.user_id WHERE r.resolved_at IS NULL ORDER BY r.created_at`);
  // a supervisor can only reset learners; the admin sees everyone
  res.json(req.user.role === 'admin' ? rows : rows.filter(r => r.role === 'learner'));
}));

// Set a temporary password after checking the learner's identity in person
router.post('/learners/:id/password', wrap(async (req, res) => {
  const pw = String(req.body.password || '');
  if (pw.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const [[u]] = await db.query('SELECT id, role FROM users WHERE id=?', [req.params.id]);
  if (!u) return res.status(404).json({ error: 'User not found.' });
  if (u.role !== 'learner' && req.user.role !== 'admin') return res.status(403).json({ error: 'Supervisors can only reset learner passwords.' });
  await db.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(pw, 10), u.id]);
  await db.query('UPDATE password_reset_requests SET resolved_at=NOW(), resolved_by=? WHERE user_id=? AND resolved_at IS NULL', [req.user.id, u.id]);
  res.json({ ok: true });
}));

module.exports = router;
