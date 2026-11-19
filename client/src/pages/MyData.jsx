import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, downloadFile } from '../api';
import { useApp } from '../context';

// Data rights for every user: see what is kept, correct it, download it, delete the account.
export default function MyData() {
  const { t, logout, lang, setLang, pick, date } = useApp();
  const [preview, setPreview] = useState(false);
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [f, setF] = useState(null);
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = () => api('/my/data').then(d => {
    setData(d);
    const p = d.profile;
    setF({ full_name: p.full_name, gender: p.gender, age_group: p.age_group || '', has_disability: p.has_disability, language: p.language });
  }).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    try { await api('/my/profile', { method: 'PATCH', body: f }); setMsg(t('saved')); if (f.language !== lang) setLang(f.language); load(); }
    catch (ex) { setErr(ex.message); }
  };
  const remove = async e => {
    e.preventDefault(); setErr('');
    if (!window.confirm(t('deleteHelp'))) return;
    try { await api('/my/account', { method: 'DELETE', body: { password: pw } }); logout(); alert(t('deleted')); nav('/'); }
    catch (ex) { setErr(ex.message); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const pdf = () => downloadFile(`/my/data.pdf?lang=${lang}`, 'my-lsda-data.pdf').catch(ex => setErr(ex.message));

  if (!data || !f) return err ? <div className="error">{err}</div> : <p>{t('loading')}</p>;
  return (
    <>
      <h1>{t('myDataTitle')}</h1>
      <p style={{ maxWidth: '65ch' }}>{t('myDataIntro')}</p>

      <div className="row2">
        <section className="card">
          <h3>{t('whatWeKeep')}</h3>
          <ul><li>{t('keep1')}</li><li>{t('keep2')}</li><li>{t('keep3')}</li></ul>
        </section>
        <section className="card">
          <h3>{t('whoSees')}</h3>
          <ul><li>{t('sees1')}</li><li>{t('sees2')}</li><li>{t('sees3')}</li></ul>
        </section>
      </div>

      <form className="panel" onSubmit={save} style={{ marginTop: 24 }}>
        <h2>{t('myDetails')}</h2>
        <p className="meta">{t('identifier')}: {data.profile.identifier}</p>
        <label htmlFor="fn">{t('fullName')}</label>
        <input id="fn" type="text" required value={f.full_name} onChange={set('full_name')} />
        <label htmlFor="g">{t('gender')}</label>
        <select id="g" value={f.gender} onChange={set('gender')}>
          {['female', 'male', 'other', 'undisclosed'].map(v => <option key={v} value={v}>{t(v)}</option>)}
        </select>
        <label htmlFor="a">{t('ageGroup')}</label>
        <select id="a" value={f.age_group} onChange={set('age_group')}>
          <option value="">–</option>
          {['under18', '18-35', '36-60', 'over60'].map(v => <option key={v} value={v}>{t(v)}</option>)}
        </select>
        <label htmlFor="d">{t('disability')}</label>
        <select id="d" value={f.has_disability} onChange={set('has_disability')}>
          {['no', 'yes', 'undisclosed'].map(v => <option key={v} value={v}>{t(v)}</option>)}
        </select>
        <label htmlFor="l">{t('language')}</label>
        <select id="l" value={f.language} onChange={set('language')}>
          <option value="so">Sesotho</option><option value="en">English</option>
        </select>
        {msg && <div className="ok">{msg}</div>}
        <p><button className="btn" type="submit">{t('save')}</button></p>
      </form>

      <section className="panel wide" style={{ marginTop: 24 }}>
        <h2>{t('download')}</h2>
        <p>{t('downloadHelp')}</p>
        <div className="nav-row" style={{ margin: 0 }}>
          <button className="btn ghost" onClick={() => setPreview(!preview)} aria-expanded={preview}>{preview ? t('hidePreview') : t('previewData')}</button>
          {preview && <button className="btn maize" onClick={pdf}>{t('downloadPdf')}</button>}
        </div>
        {preview && <DataPreview data={data} t={t} pick={pick} date={date} />}
        {preview && <p><button className="btn maize" onClick={pdf}>{t('downloadPdf')}</button></p>}
      </section>

      <form className="panel danger" onSubmit={remove} style={{ marginTop: 24 }}>
        <h2>{t('deleteTitle')}</h2>
        <p>{t('deleteHelp')}</p>
        <label htmlFor="dp">{t('deleteConfirm')}</label>
        <input id="dp" type="password" required autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} />
        {err && <div className="error">{err}</div>}
        <p><button className="btn danger" type="submit">{t('deleteBtn')}</button></p>
        <p className="meta">{t('askInPerson')}</p>
      </form>
    </>
  );
}

// On-screen copy of exactly what goes into the PDF
function DataPreview({ data, t, pick, date }) {
  const p = data.profile;
  const yn = v => (v ? t('yes') : t('no'));
  const Table = ({ head, rows }) => (rows.length === 0 ? <p className="meta">{t('noRecords')}</p> : (
    <div className="table-wrap"><table>
      <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  ));
  return (
    <div className="preview" aria-label={t('previewData')}>
      <h2 style={{ marginBottom: 0 }}>{t('myData')}</h2>
      <p className="meta">{t('createdOn')} {date(data.exported_at)}</p>

      <h3>{t('myDetails')}</h3>
      <dl>
        <dt>{t('fullName')}</dt><dd>{p.full_name}</dd>
        <dt>{t('identifier')}</dt><dd>{p.identifier}</dd>
        <dt>{t('role')}</dt><dd>{t('r_' + p.role)}</dd>
        <dt>{t('gender')}</dt><dd>{t(p.gender)}</dd>
        <dt>{t('ageGroup')}</dt><dd>{p.age_group ? t(p.age_group) : '–'}</dd>
        <dt>{t('disability')}</dt><dd>{t(p.has_disability)}</dd>
        <dt>{t('language')}</dt><dd>{p.language === 'so' ? 'Sesotho' : 'English'}</dd>
        <dt>{t('consentGiven')}</dt><dd>{date(p.consent_at)}</dd>
        <dt>{t('guardianConsent')}</dt><dd>{yn(p.guardian_consent)}</dd>
        <dt>{t('joined')}</dt><dd>{date(p.created_at)}</dd>
      </dl>

      <h3>{t('coursesJoined')}</h3>
      <Table head={[t('course'), t('date')]} rows={data.enrolments.map(e => [pick(e, 'title'), date(e.enrolled_at)])} />
      <h3>{t('lessonsFinished')}</h3>
      <Table head={[t('course'), t('lessonList'), t('date')]} rows={data.lessons.map(l => [pick(l, 'course'), pick(l, 'title'), date(l.completed_at)])} />
      <h3>{t('quizResults')}</h3>
      <Table head={[t('course'), t('quizCol'), t('yourScore'), t('passedCol'), t('date')]}
        rows={data.quizzes.map(q => [pick(q, 'title'), q.kind === 'pre' ? t('pretest') : t('finalQuiz'), q.score + '%', q.kind === 'pre' ? '–' : yn(q.passed), date(q.created_at)])} />
      <h3>{t('certsCol')}</h3>
      <Table head={[t('id'), t('course'), t('date'), t('status')]} rows={data.certificates.map(c => [c.certificate_no, pick(c, 'title'), date(c.issued_at), c.status === 'valid' ? t('validCert') : t('revokedCert')])} />
      <h3>{t('myFeedback')}</h3>
      <Table head={[t('rating'), t('usable'), t('commentCol'), t('date')]} rows={data.feedback.map(f => [f.rating + '/5', yn(f.usability_ok), f.comment || '–', date(f.created_at)])} />
      <h3>{t('helpMine')}</h3>
      <Table head={['#', t('fromCol'), t('questionCol'), t('status'), t('date')]}
        rows={data.help.map(h => ['#' + h.request, h.sender === 'me' ? t('you') : t('supervisorWord'), h.message, t('st_' + h.status), date(h.created_at)])} />
    </div>
  );
}
