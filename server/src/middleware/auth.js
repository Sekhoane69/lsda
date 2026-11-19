const jwt = require('jsonwebtoken');
const db = require('../db');
const SECRET = process.env.JWT_SECRET || 'change-me';

// Roles: 'learner', 'supervisor' (guides learners and checks their progress), 'admin' (everything)
const sign = u => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '7d' });

function read(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

// Looks the user up on every request, so a deleted account stops working at once
// and a role change made by the admin takes effect immediately.
async function load(req) {
  const t = read(req);
  if (!t) return null;
  const [rows] = await db.query('SELECT id, role FROM users WHERE id=?', [t.id]);
  return rows[0] || null;
}

const optional = (req, res, next) => load(req).then(u => { req.user = u; next(); }).catch(next);
const required = (req, res, next) => load(req).then(u => {
  if (!u) return res.status(401).json({ error: 'Please log in to continue.' });
  req.user = u; next();
}).catch(next);
const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have access to this.' });

// Supervisors monitor courses; they do not study them (no enrolling, lessons ticked, quizzes or certificates)
const notSupervisor = (req, res, next) =>
  req.user.role === 'supervisor' ? res.status(403).json({ error: 'Supervisors monitor courses and cannot take them.' }) : next();

module.exports = { sign, optional, required, allow, notSupervisor };
