// One-time setup: creates server/.env, checks the MySQL login, creates the tables and loads the courses.
// Run from the lsda folder:  npm run setup      (or from server/: npm run setup)
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');
const { spawnSync } = require('child_process');
const mysql = require('mysql2/promise');

const ENV = path.join(__dirname, '..', '.env');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const lines = [];
let waiting = null;
rl.on('line', l => { if (waiting) { const w = waiting; waiting = null; w(l); } else lines.push(l); });
const ask = (q, dflt = '') => new Promise(resolve => {
  process.stdout.write(`${q}${dflt !== '' ? ` [${dflt}]` : ''}: `);
  const done = a => { const v = String(a).trim(); resolve(v === '' ? dflt : v); };
  if (lines.length) done(lines.shift()); else waiting = done;
});

const readEnv = () => Object.fromEntries(fs.readFileSync(ENV, 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const lanIp = () => (Object.values(os.networkInterfaces()).flat().find(a => a && a.family === 'IPv4' && !a.internal) || {}).address || 'localhost';

async function canConnect(c) {
  try {
    const conn = await mysql.createConnection({ host: c.DB_HOST, user: c.DB_USER, password: c.DB_PASSWORD });
    await conn.end();
    return true;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') console.log('  MySQL is not running. Start MySQL (XAMPP or the MySQL service) and try again.');
    else if (err.code === 'ER_ACCESS_DENIED_ERROR') console.log('  Wrong MySQL user or password.');
    else console.log('  ' + err.message);
    return false;
  }
}

(async () => {
  console.log('\n=== LSDA setup ===\n');
  let cfg = null;
  if (fs.existsSync(ENV)) {
    const keep = (await ask('server/.env already exists. Keep these settings? (y/n)', 'y')).toLowerCase();
    if (keep.startsWith('y')) cfg = readEnv();
  }
  for (let attempt = 1; ; attempt++) {
    if (!cfg) {
      cfg = {
        PORT: '5000',
        DB_HOST: await ask('MySQL host', 'localhost'),
        DB_USER: await ask('MySQL user', 'root'),
        DB_PASSWORD: await ask('MySQL password (leave empty if none)', ''),
        DB_NAME: await ask('Database name', 'lsda'),
        ADMIN_IDENTIFIER: await ask('Admin login (email)', 'admin@lsda.local'),
        ADMIN_PASSWORD: await ask('Admin password (at least 6 characters)', 'ChangeMe123')
      };
    }
    console.log('\nChecking the MySQL login...');
    if (await canConnect(cfg)) { console.log('  OK'); break; }
    if (attempt >= 3) { console.log('\nSetup stopped. Fix MySQL and run "npm run setup" again.'); process.exit(1); }
    console.log('Let us try again.\n');
    cfg = null;
  }

  cfg.PORT = cfg.PORT || '5000';
  cfg.DB_NAME = cfg.DB_NAME || 'lsda';
  if (!cfg.JWT_SECRET || cfg.JWT_SECRET.startsWith('change-this')) cfg.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  cfg.PUBLIC_URL = cfg.PUBLIC_URL && !cfg.PUBLIC_URL.includes('5173') ? cfg.PUBLIC_URL : `http://${lanIp()}:${cfg.PORT}`;
  cfg.ADMIN_IDENTIFIER = cfg.ADMIN_IDENTIFIER || 'admin@lsda.local';
  cfg.ADMIN_PASSWORD = cfg.ADMIN_PASSWORD || 'ChangeMe123';

  const out = [
    '# LSDA settings (created by npm run setup). Keep this file private: never upload or hand it in.',
    `PORT=${cfg.PORT}`, `DB_HOST=${cfg.DB_HOST}`, `DB_USER=${cfg.DB_USER}`, `DB_PASSWORD=${cfg.DB_PASSWORD}`, `DB_NAME=${cfg.DB_NAME}`,
    `JWT_SECRET=${cfg.JWT_SECRET}`,
    '# Address printed in the certificate QR code (the laptop address phones use)',
    `PUBLIC_URL=${cfg.PUBLIC_URL}`,
    `ADMIN_IDENTIFIER=${cfg.ADMIN_IDENTIFIER}`, `ADMIN_PASSWORD=${cfg.ADMIN_PASSWORD}`, ''
  ].join('\n');
  fs.writeFileSync(ENV, out);
  console.log('Saved server/.env');
  rl.close();

  const run = file => spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: 'inherit', cwd: path.join(__dirname, '..') }).status;
  console.log('\nCreating / updating the database...');
  if (run('init.js') !== 0) { console.log('Database setup failed (see the message above).'); process.exit(1); }
  console.log('\nLoading the courses and the admin account...');
  if (run('seed.js') !== 0) { console.log('Loading courses failed (see the message above).'); process.exit(1); }
  if (run('update-content.js') !== 0) { console.log('Content update failed (see the message above).'); process.exit(1); }

  console.log(`\nSetup complete.
  Admin login: ${cfg.ADMIN_IDENTIFIER} / ${cfg.ADMIN_PASSWORD}  (change the password after logging in)
  Next, from the lsda folder:
    npm run dev      while you are developing (website on http://localhost:5173)
    npm run build    then  npm start   for the pilot laptop (website on http://localhost:${cfg.PORT} and on the Wi-Fi address it prints)\n`);
})().catch(e => { console.error(e.message); process.exit(1); });
