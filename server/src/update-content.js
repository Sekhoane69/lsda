// Updates a database that was seeded with the OLD starter content:
//  - fills in missing Sesotho for courses, lessons and questions (it never overwrites Sesotho you already typed)
//  - adds the separate starter-quiz (pre) questions to courses that have none
// Courses, lessons and questions are matched by their English text. Safe to run more than once.
// Run: npm run content:update
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const db = require('./db');
const migrate = require('./migrate');
const courses = require('./content');

(async () => {
  await migrate();
  let filled = 0, added = 0;
  for (const c of courses) {
    const [[course]] = await db.query('SELECT id FROM courses WHERE title_en=?', [c.title_en]);
    if (!course) { console.log('Not found, skipped:', c.title_en); continue; }
    const [r1] = await db.query(
      `UPDATE courses SET title_so=COALESCE(NULLIF(title_so,''),?), description_so=COALESCE(NULLIF(description_so,''),?) WHERE id=?`,
      [c.title_so, c.description_so, course.id]);
    filled += r1.changedRows;
    for (const l of c.lessons) {
      const [r] = await db.query(
        `UPDATE lessons SET title_so=COALESCE(NULLIF(title_so,''),?), body_so=COALESCE(NULLIF(body_so,''),?) WHERE course_id=? AND title_en=?`,
        [l.title_so, l.body_so, course.id, l.title_en]);
      filled += r.changedRows;
    }
    let [[quiz]] = await db.query('SELECT id FROM quizzes WHERE course_id=?', [course.id]);
    if (!quiz) { const [q] = await db.query('INSERT INTO quizzes (course_id, pass_mark) VALUES (?,70)', [course.id]); quiz = { id: q.insertId }; }
    for (const q of c.post) {
      const [r] = await db.query(
        `UPDATE questions SET text_so=COALESCE(NULLIF(text_so,''),?), options_so=COALESCE(options_so,?) WHERE quiz_id=? AND text_en=?`,
        [q.text_so, JSON.stringify(q.options_so), quiz.id, q.text_en]);
      filled += r.changedRows;
    }
    const [[{ n }]] = await db.query("SELECT COUNT(*) n FROM questions WHERE quiz_id=? AND qset='pre'", [quiz.id]);
    if (n === 0) {
      for (const q of c.pre) {
        await db.query(
          'INSERT INTO questions (quiz_id, qset, text_en, text_so, options_en, options_so, correct_index) VALUES (?,?,?,?,?,?,?)',
          [quiz.id, 'pre', q.text_en, q.text_so, JSON.stringify(q.options_en), JSON.stringify(q.options_so), q.correct]);
        added++;
      }
    }
  }
  console.log(`Sesotho filled in for ${filled} items. Starter-quiz questions added: ${added}.`);
  await db.end();
})().catch(e => { console.error(e.message); process.exit(1); });
