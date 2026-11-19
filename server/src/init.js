require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  let sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  const dbName = process.env.DB_NAME || 'lsda';
  sql = sql.replace(/\blsda\b/g, dbName);
  await conn.query(sql);
  await conn.end();
  // Update older databases (roles, question sets, help tables)
  const db = require('./db');
  await require('./migrate')();
  await db.end();
  console.log('Database ready:', dbName);
})().catch(e => { console.error(e.message); process.exit(1); });
