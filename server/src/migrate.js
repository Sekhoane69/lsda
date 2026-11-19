// Brings an older LSDA database up to date. Safe to run many times.
// Runs automatically at the end of `npm run db:init`; you can also run `npm run db:migrate`.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const db = require('./db');

async function columnType(table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_TYPE t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?`,
    [table, column]);
  return rows[0] ? rows[0].t : null;
}

async function migrate() {
  // 1. Roles: 'instructor' becomes 'supervisor'
  const role = await columnType('users', 'role');
  if (role && !role.includes("'supervisor'")) {
    await db.query("ALTER TABLE users MODIFY role ENUM('learner','instructor','supervisor','admin') NOT NULL DEFAULT 'learner'");
    await db.query("UPDATE users SET role='supervisor' WHERE role='instructor'");
    await db.query("ALTER TABLE users MODIFY role ENUM('learner','supervisor','admin') NOT NULL DEFAULT 'learner'");
    console.log('Roles updated: instructor -> supervisor');
  }

  // 2. Separate question sets for the starter quiz and the final assessment
  if (!(await columnType('questions', 'qset'))) {
    await db.query("ALTER TABLE questions ADD COLUMN qset ENUM('pre','post') NOT NULL DEFAULT 'post' AFTER quiz_id");
    console.log('Added questions.qset (existing questions are now final-assessment questions)');
  }

  // 3. Help requests
  await db.query(`CREATE TABLE IF NOT EXISTS help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, course_id INT NULL,
    status ENUM('open','answered','closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL)`);
  await db.query(`CREATE TABLE IF NOT EXISTS help_messages (
    id INT AUTO_INCREMENT PRIMARY KEY, request_id INT NOT NULL, sender_id INT NULL,
    body VARCHAR(1000) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL)`);

  // 4. Forgot-password requests
  await db.query(`CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP NULL, resolved_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL)`);
}

module.exports = migrate;

if (require.main === module) {
  migrate().then(() => { console.log('Migration complete.'); return db.end(); })
    .catch(e => { console.error(e.message); process.exit(1); });
}
