// "My data" PDF: everything the Academy stores about one learner, in English or Sesotho.
const PDFDocument = require('pdfkit');

const navy = '#17264A', gold = '#E2A72E', red = '#B8372F', green = '#2E7D5B', line = '#D3D9E4', muted = '#56627D';

const L = {
  en: {
    title: 'My data', sub: 'Everything the Lesotho Digital Skills Academy stores about you', made: 'Created on',
    profile: 'My details', name: 'Full name', contact: 'Email or phone', role: 'Role', gender: 'Gender', age: 'Age group',
    disability: 'Disability', language: 'Language', consent: 'Consent given', guardian: 'Guardian consent', joined: 'Account created',
    enrolments: 'Courses joined', course: 'Course', date: 'Date', lessons: 'Lessons finished', lesson: 'Lesson',
    quizzes: 'Quiz results', quiz: 'Quiz', score: 'Score', passed: 'Passed', pre: 'Starter quiz', post: 'Final assessment',
    certificates: 'Certificates', certNo: 'Certificate ID', status: 'Status', feedback: 'Feedback', rating: 'Rating',
    usable: 'Used without help', comment: 'Comment', help: 'Help questions', from: 'From', message: 'Message',
    me: 'Me', supervisor: 'Supervisor', none: 'Nothing recorded.', yes: 'Yes', no: 'No',
    footer: 'Private. You can correct or delete this information on the "My data" page.',
    vals: { female: 'Female', male: 'Male', other: 'Other', undisclosed: 'Prefer not to say', under18: 'Under 18', '18-35': '18-35', '36-60': '36-60', over60: '60 and older',
      learner: 'Learner', supervisor: 'Supervisor', admin: 'Admin', en: 'English', so: 'Sesotho', valid: 'Valid', revoked: 'Revoked',
      open: 'Waiting for reply', answered: 'Answered', closed: 'Closed' }
  },
  so: {
    title: 'Lintlha tsa ka', sub: 'Lintlha tsohle tseo Lesotho Digital Skills Academy e li bolokang ka uena', made: 'E entsoe ka',
    profile: 'Lintlha tsa ka', name: 'Lebitso le feletseng', contact: 'Imeile kapa mohala', role: 'Boemo', gender: 'Bong', age: 'Sehlopha sa lilemo',
    disability: 'Bokooa', language: 'Puo', consent: 'Tumello e fanoe', guardian: 'Tumello ea mohlokomeli', joined: 'Akhaonte e entsoe',
    enrolments: 'Lithuto tseo ke li keneng', course: 'Thuto', date: 'Letsatsi', lessons: 'Lithuto tse phethiloeng', lesson: 'Karolo ea thuto',
    quizzes: 'Liphetho tsa litlhahlobo', quiz: 'Tlhahlobo', score: 'Letšoao', passed: 'O fetile', pre: 'Tlhahlobo ea ho qala', post: 'Tlhahlobo ea ho qetela',
    certificates: 'Litifikeiti', certNo: 'Nomoro ea setifikeiti', status: 'Boemo', feedback: 'Maikutlo', rating: 'Tekanyo',
    usable: 'Ntle le thuso', comment: 'Maikutlo', help: 'Lipotso tsa thuso', from: 'Ho tsoa ho', message: 'Molaetsa',
    me: 'Nna', supervisor: 'Motataisi', none: 'Ha ho letho le ngotsoeng.', yes: 'E', no: 'Che',
    footer: 'Lekunutu. U ka lokisa kapa ua hlakola lintlha tsena leqepheng la "Lintlha tsa ka".',
    vals: { female: 'Mosali', male: 'Monna', other: 'Tse ling', undisclosed: 'Ha ke batle ho bolela', under18: 'Ka tlase ho 18', '18-35': '18-35', '36-60': '36-60', over60: '60 le ho feta',
      learner: 'Moithuti', supervisor: 'Motataisi', admin: 'Motsamaisi', en: 'Senyesemane', so: 'Sesotho', valid: 'Se nepahetse', revoked: 'Se hlakotsoe',
      open: 'E emetse karabo', answered: 'E arabiloe', closed: 'E koetsoe' }
  }
};

function streamDataReport(res, data, lang = 'en') {
  const t = L[lang];
  const v = x => (x === null || x === undefined || x === '' ? '-' : t.vals[x] || String(x));
  const d = x => (x ? new Date(x).toLocaleDateString('en-GB') : '-');
  const pick = (o, f = 'title') => (lang === 'so' && o[f + '_so']) || o[f + '_en'];
  const yn = x => (x ? t.yes : t.no);

  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true, info: { Title: t.title } });
  doc.pipe(res);
  const W = doc.page.width - 100;
  const bottom = () => doc.page.height - 70;

  // Basotho-blanket band, same colours as the website
  const band = y => { const cols = [navy, gold, red, green, navy, red, gold]; const w = [28, 12, 12, 28, 12, 12, 12]; let x = 0, i = 0;
    while (x < doc.page.width) { doc.rect(x, y, w[i % 7], 8).fill(cols[i % 7]); x += w[i % 7]; i++; } };

  band(0);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(24).text(t.title, 50, 40);
  doc.fillColor(muted).font('Helvetica').fontSize(11).text(t.sub);
  doc.text(`${t.made} ${d(data.exported_at)}`);
  doc.moveDown(1);

  const heading = s => {
    if (doc.y > bottom() - 60) doc.addPage();
    doc.moveDown(0.6).fillColor(navy).font('Helvetica-Bold').fontSize(14).text(s, 50);
    doc.moveTo(50, doc.y + 2).lineTo(50 + W, doc.y + 2).lineWidth(2).strokeColor(gold).stroke();
    doc.moveDown(0.6);
  };

  // Simple table with wrapping cells and page breaks. cols = [[label, widthFraction]]
  const table = (cols, rows) => {
    if (!rows.length) { doc.fillColor(muted).font('Helvetica-Oblique').fontSize(10).text(t.none, 50); return; }
    const widths = cols.map(c => c[1] * W);
    const drawRow = (cells, bold) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
      const h = Math.max(...cells.map((c, i) => doc.heightOfString(String(c), { width: widths[i] - 8 }))) + 8;
      if (doc.y + h > bottom()) { doc.addPage(); if (!bold) drawRow(cols.map(c => c[0]), true); }
      const y = doc.y; let x = 50;
      if (bold) doc.rect(50, y, W, h).fill(navy);
      cells.forEach((c, i) => { doc.fillColor(bold ? '#FFFFFF' : navy).text(String(c), x + 4, y + 4, { width: widths[i] - 8 }); x += widths[i]; });
      doc.moveTo(50, y + h).lineTo(50 + W, y + h).lineWidth(0.5).strokeColor(line).stroke();
      doc.y = y + h; doc.x = 50;
    };
    drawRow(cols.map(c => c[0]), true);
    rows.forEach(r => drawRow(r, false));
  };

  const p = data.profile;
  heading(t.profile);
  [[t.name, p.full_name], [t.contact, p.identifier], [t.role, v(p.role)], [t.gender, v(p.gender)], [t.age, v(p.age_group)],
   [t.disability, v(p.has_disability === 'yes' ? t.yes : p.has_disability === 'no' ? t.no : p.has_disability)],
   [t.language, v(p.language)], [t.consent, d(p.consent_at)], [t.guardian, yn(p.guardian_consent)], [t.joined, d(p.created_at)]]
    .forEach(([k, val]) => {
      const y = doc.y;
      doc.fillColor(muted).font('Helvetica').fontSize(10).text(k, 50, y, { width: W * 0.35 });
      doc.fillColor(navy).font('Helvetica-Bold').text(String(val), 50 + W * 0.35, y, { width: W * 0.65 });
      doc.y = Math.max(doc.y, y + 16); doc.x = 50;
    });

  heading(t.enrolments);
  table([[t.course, 0.7], [t.date, 0.3]], data.enrolments.map(e => [pick(e), d(e.enrolled_at)]));
  heading(t.lessons);
  table([[t.course, 0.35], [t.lesson, 0.45], [t.date, 0.2]], data.lessons.map(l => [pick(l, 'course'), pick(l), d(l.completed_at)]));
  heading(t.quizzes);
  table([[t.course, 0.38], [t.quiz, 0.24], [t.score, 0.12], [t.passed, 0.11], [t.date, 0.15]],
    data.quizzes.map(q => [pick(q), q.kind === 'pre' ? t.pre : t.post, q.score + '%', q.kind === 'pre' ? '-' : yn(q.passed), d(q.created_at)]));
  heading(t.certificates);
  table([[t.certNo, 0.28], [t.course, 0.42], [t.date, 0.15], [t.status, 0.15]],
    data.certificates.map(c => [c.certificate_no, pick(c), d(c.issued_at), v(c.status)]));
  heading(t.feedback);
  table([[t.rating, 0.12], [t.usable, 0.2], [t.comment, 0.53], [t.date, 0.15]],
    data.feedback.map(f => [f.rating + '/5', yn(f.usability_ok), f.comment || '-', d(f.created_at)]));
  heading(t.help);
  table([['#', 0.08], [t.from, 0.17], [t.message, 0.45], [t.status, 0.15], [t.date, 0.15]],
    data.help.map(h => ['#' + h.request, h.sender === 'me' ? t.me : t.supervisor, h.message, v(h.status), d(h.created_at)]));

  // Footer on every page
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;          // let the footer sit below the normal margin without creating a new page
    doc.fillColor(muted).font('Helvetica').fontSize(8)
      .text(`${t.footer}   ${i + 1}/${range.count}`, 50, doc.page.height - 45, { width: W, align: 'center', lineBreak: false });
    band(doc.page.height - 8);
  }
  doc.end();
}

module.exports = { streamDataReport };
