require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const mysql = require('mysql2/promise');
module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '59544945',
  database: process.env.DB_NAME || 'lsda',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});
