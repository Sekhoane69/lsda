
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env')
});

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.localhost,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.root,
  password: process.env.59544945,
  database: process.env.lsda,

  ssl: {
    ca: process.env.DB_SSL_CA,
    rejectUnauthorized: true
  },

  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = db;
