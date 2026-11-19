// Starts the server and the website together for development: npm run dev (from the lsda folder).
// Works on Windows, macOS and Linux. Press Ctrl+C once to stop both.
const { spawn } = require('child_process');
const path = require('path');
const procs = [];
function start(name, dir, color) {
  const p = spawn('npm', ['run', 'dev'], { cwd: path.join(__dirname, dir), shell: true });
  const tag = `\x1b[${color}m[${name}]\x1b[0m `;
  const out = s => s.toString().split(/\r?\n/).filter(Boolean).forEach(l => console.log(tag + l));
  p.stdout.on('data', out); p.stderr.on('data', out);
  p.on('exit', code => { console.log(tag + `stopped (code ${code})`); procs.forEach(x => x !== p && x.kill()); process.exit(code || 0); });
  procs.push(p);
}
start('server', 'server', 36);
start('website', 'client', 33);
process.on('SIGINT', () => { procs.forEach(p => p.kill()); process.exit(0); });
