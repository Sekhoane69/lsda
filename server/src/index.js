require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // always server/.env, whatever folder you start from
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/learning'));
app.use('/api', require('./routes/certificates'));
app.use('/api', require('./routes/privacy'));
app.use('/api', require('./routes/help'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// After `npm run build` in client/, this server also serves the website itself,
// so the pilot laptop only needs ONE command: npm start
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html'))); // React handles the page routes
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
});

// Addresses phones on the same Wi-Fi can open
const lanAddresses = () => Object.values(os.networkInterfaces()).flat()
  .filter(a => a && a.family === 'IPv4' && !a.internal).map(a => a.address);

const PORT = Number(process.env.PORT) || 5000;

// Check the database first, and explain problems in plain words
db.query('SELECT 1 FROM users LIMIT 1')
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\nLSDA server running on http://localhost:${PORT}`);
      if (fs.existsSync(path.join(dist, 'index.html'))) {
        console.log('Website: open one of these addresses on the laptop or on phones connected to the same Wi-Fi:');
        console.log(`  http://localhost:${PORT}`);
        lanAddresses().forEach(a => console.log(`  http://${a}:${PORT}`));
      } else {
        console.log('API only. For the website run "npm run dev" in client/, or "npm run build" there once and restart this server.');
      }
    });
  })
  .catch(err => {
    console.error('\nThe server could not use the database.');
    if (err.code === 'ECONNREFUSED') console.error('-> MySQL is not running. Start MySQL (e.g. XAMPP or the MySQL service), then try again.');
    else if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('-> Wrong MySQL user or password. Fix DB_USER / DB_PASSWORD in server/.env (or run "npm run setup").');
    else if (err.code === 'ER_BAD_DB_ERROR' || err.code === 'ER_NO_SUCH_TABLE') console.error('-> The database is not set up yet. Run "npm run setup" (or "npm run db:init" then "npm run seed").');
    else console.error('-> ' + err.message);
    process.exit(1);
  });
