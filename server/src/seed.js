// Loads the six starter courses (English + Sesotho, two question sets) and the admin account.
// Run once on a new database: npm run seed
// If you seeded an older version already, run: npm run content:update
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const bcrypt = require('bcryptjs');
const db = require('./db');
const courses = require('./content');

async function insertQuestions(quizId, qset, list) {
  for (const q of list)
    await db.query(
      'INSERT INTO questions (quiz_id, qset, text_en, text_so, options_en, options_so, correct_index) VALUES (?,?,?,?,?,?,?)',
      [quizId, qset, q.text_en, q.text_so, JSON.stringify(q.options_en), JSON.stringify(q.options_so), q.correct]);
}

(async () => {
  const [[{ n }]] = await db.query('SELECT COUNT(*) n FROM courses');
  if (n > 0) { console.log('Courses already exist. Skipping course seed (use `npm run content:update` to add the new content).'); }
  else {
    let moduleNo = 1;
    for (const c of courses) {
      const [r] = await db.query(
        'INSERT INTO courses (module_no, title_en, title_so, description_en, description_so) VALUES (?,?,?,?,?)',
        [moduleNo++, c.title_en, c.title_so, c.description_en, c.description_so]);
      let pos = 1;
      for (const l of c.lessons)
        await db.query('INSERT INTO lessons (course_id, position, title_en, title_so, body_en, body_so) VALUES (?,?,?,?,?,?)',
          [r.insertId, pos++, l.title_en, l.title_so, l.body_en, l.body_so]);
      const [qz] = await db.query('INSERT INTO quizzes (course_id, pass_mark) VALUES (?,70)', [r.insertId]);
      await insertQuestions(qz.insertId, 'pre', c.pre);
      await insertQuestions(qz.insertId, 'post', c.post);
    }
    console.log(`Seeded ${courses.length} courses.`);
  }

  const id = (process.env.ADMIN_IDENTIFIER || 'admin@lsda.local').toLowerCase();
  const [ex] = await db.query('SELECT id FROM users WHERE identifier=?', [id]);
  if (!ex.length) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123', 10);
    await db.query("INSERT INTO users (full_name, identifier, password_hash, role, consent_at) VALUES ('Academy Administrator',?,?,'admin',NOW())", [id, hash]);
    console.log('Admin account created:', id);
  }
  await db.end();
})().catch(e => { console.error(e.message); process.exit(1); });
