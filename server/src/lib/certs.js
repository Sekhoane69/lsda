const db = require('../db');

// Issue one certificate per learner per course. Safe to call more than once.
async function issueCertificate(userId, courseId) {
  const [existing] = await db.query('SELECT * FROM certificates WHERE user_id=? AND course_id=?', [userId, courseId]);
  if (existing.length) return existing[0];
  const temp = 'TMP-' + Math.random().toString(36).slice(2, 10);
  const [ins] = await db.query('INSERT INTO certificates (user_id, course_id, certificate_no) VALUES (?,?,?)', [userId, courseId, temp]);
  const no = `LSDA-${new Date().getFullYear()}-${String(ins.insertId).padStart(5, '0')}`;
  await db.query('UPDATE certificates SET certificate_no=? WHERE id=?', [no, ins.insertId]);
  const [row] = await db.query('SELECT * FROM certificates WHERE id=?', [ins.insertId]);
  return row[0];
}
module.exports = { issueCertificate };
