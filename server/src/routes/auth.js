const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const wrap = require('../util');
const { sign, required } = require('../middleware/auth');

const pub = u => ({
  id: u.id,
  full_name: u.full_name,
  identifier: u.identifier,
  role: u.role,
  language: u.language,
});

router.post('/auth/register', wrap(async (req, res) => {
  const {
    full_name,
    password,
    gender = 'undisclosed',
    age_group = null,
    has_disability = 'undisclosed',
    language = 'en',
    consent,
    guardian_consent,
  } = req.body;
  const identifier = String(req.body.identifier || '').trim().toLowerCase();

  if (!full_name || !identifier || !password)
    return res.status(400).json({ error: 'Full name, email or phone number, and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (!consent)
    return res.status(400).json({ error: 'You must agree to how your information is used before registering.' });
  if (age_group === 'under18' && !guardian_consent)
    return res.status(400).json({ error: 'A parent or guardian must agree before a learner under 18 can register.' });

  const [dup] = await db.query('SELECT id FROM users WHERE identifier=?', [identifier]);
  if (dup.length) return res.status(409).json({ error: 'That email or phone number is already registered. Try logging in.' });

  const hash = await bcrypt.hash(password, 10);
  const [ins] = await db.query(
    `INSERT INTO users (full_name, identifier, password_hash, gender, age_group, has_disability, language, consent_at, guardian_consent)
     VALUES (?,?,?,?,?,?,?,NOW(),?)`,
    [full_name.trim(), identifier, hash, gender, age_group, has_disability, language === 'so' ? 'so' : 'en', guardian_consent ? 1 : 0]
  );

  const user = { id: ins.insertId, full_name: full_name.trim(), identifier, role: 'learner', language };
  res.json({ token: sign(user), user: pub(user) });
}));

// Forgot password: the learner sends a request; a supervisor or the admin checks who they are
// in person and sets a temporary password. (Resetting by phone number alone would let anyone
// take over someone else's account, so the system never does that.)
router.post('/auth/forgot-password', wrap(async (req, res) => {
  const identifier = String(req.body.identifier || '').trim().toLowerCase();
  if (!identifier) return res.status(400).json({ error: 'Enter the email or phone number you registered with.' });
  const [rows] = await db.query('SELECT id FROM users WHERE identifier=?', [identifier]);
  if (rows[0]) {
    const [open] = await db.query('SELECT id FROM password_reset_requests WHERE user_id=? AND resolved_at IS NULL', [rows[0].id]);
    if (!open.length) await db.query('INSERT INTO password_reset_requests (user_id) VALUES (?)', [rows[0].id]);
  }
  // Same answer whether or not the account exists, so nobody can test which numbers are registered
  res.json({ ok: true });
}));

router.post('/auth/login', wrap(async (req, res) => {
  const identifier = String(req.body.identifier || '').trim().toLowerCase();
  const [rows] = await db.query('SELECT * FROM users WHERE identifier=?', [identifier]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password_hash)))
    return res.status(401).json({ error: 'Wrong email/phone number or password.' });
  res.json({ token: sign(u), user: pub(u) });
}));

router.get('/auth/me', required, wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id=?', [req.user.id]);
  if (!rows[0]) return res.status(401).json({ error: 'Account not found.' });
  res.json(pub(rows[0]));
}));

module.exports = router;
