// Lets async route handlers pass errors to Express (Express 4 does not do this itself)
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
