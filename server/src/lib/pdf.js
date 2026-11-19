const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Streams a landscape A4 certificate into `res`.
async function streamCertificate(res, { name, course, date, no }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
  doc.pipe(res);
  const W = doc.page.width, H = doc.page.height;
  const navy = '#17264A', maize = '#E2A72E', green = '#2E7D5B', mist = '#D3D9E4', red = '#B8372F';

  doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke(navy);
  doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke(maize);

  // Basotho-blanket inspired woven band (top and bottom)
  const bands = [navy, maize, red, green, navy, red, maize];
  const bw = 16;
  for (let i = 0, x = 45; x < W - 45; i++, x += bw) {
    const c = bands[i % bands.length];
    const w = Math.min(bw, W - 45 - x);
    doc.rect(x, 45, w, 12).fill(c);
    doc.rect(x, H - 57, w, 12).fill(c);
  }

  const center = (txt, y, size, font, color = navy) =>
    doc.fillColor(color).font(font).fontSize(size).text(txt, 0, y, { width: W, align: 'center' });

  center('CERTIFICATE OF COMPLETION', 90, 30, 'Helvetica-Bold');
  center('Lesotho Digital Skills Academy', 130, 16, 'Helvetica', green);
  center('Free digital learning programme', 150, 11, 'Helvetica', '#555555');
  center('This certificate is proudly presented to', 195, 13, 'Helvetica', '#333333');
  center(name, 220, 36, 'Times-BoldItalic');
  doc.moveTo(W / 2 - 200, 270).lineTo(W / 2 + 200, 270).lineWidth(1).stroke(maize);
  center('for successfully completing', 285, 13, 'Helvetica', '#333333');
  center(course, 310, 24, 'Helvetica-Bold');
  center(`Date of completion: ${date}`, 355, 12, 'Helvetica', '#333333');

  // Signature block
  doc.moveTo(90, H - 120).lineTo(280, H - 120).lineWidth(0.8).stroke('#333333');
  doc.fillColor('#333333').font('Helvetica').fontSize(10)
    .text('Director, Digital Skills Academy', 90, H - 112, { width: 190, align: 'center' });

  // QR code + certificate ID
  const url = `${process.env.PUBLIC_URL || 'http://localhost:5173'}/verify/${no}`;
  const qr = await QRCode.toBuffer(url, { margin: 1, width: 240 });
  doc.image(qr, W - 170, H - 175, { width: 90 });
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(10).text(`Certificate ID: ${no}`, W - 390, H - 78, { width: 310, align: 'right' });
  doc.fillColor('#555555').font('Helvetica').fontSize(8)
    .text('Scan the code to verify this certificate on the academy website.', W - 390, H - 66, { width: 310, align: 'right' });
  doc.fillColor('#777777').fontSize(7.5)
    .text('Academy-issued certificate of completion. It is not an accredited qualification.', 0, H - 90, { width: W, align: 'center' });

  doc.end();
}
module.exports = { streamCertificate };
