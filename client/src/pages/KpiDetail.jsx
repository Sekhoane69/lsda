import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

// The records behind one M&E indicator (opened by clicking an indicator on the Supervise page)
export default function KpiDetail() {
  const { key } = useParams();
  const { t, pick, date } = useApp();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { setRows(null); api('/staff/kpi/' + key).then(d => setRows(d.rows)).catch(e => setErr(e.message)); }, [key]);

  const pc = v => (v === null || v === undefined ? '–' : v + '%');
  const who = r => <Link to={`/supervise/learners/${r.user_id}`}>{r.full_name}</Link>;
  const course = r => (r.title_en ? pick(r, 'title') : t('helpAny'));
  const status = r => <span className={'pill ' + (r.status === 'certified' ? 'answered' : r.status === 'not_started' ? 'closed' : 'open')}>{t('es_' + r.status)}</span>;

  const learnerCols = [[t('learner'), who], [t('contact'), r => r.identifier], [t('gender'), r => t(r.gender)],
    [t('ageGroup'), r => (r.age_group ? t(r.age_group) : '–')], [t('disability'), r => t(r.has_disability)], [t('joined'), r => date(r.created_at)]];
  const enrolCols = [[t('learner'), who], [t('course'), course], [t('joined'), r => date(r.enrolled_at)],
    [t('progress'), r => `${r.done}/${r.total}`], [t('status'), status]];
  const feedbackCols = [[t('learner'), who], [t('course'), course], [t('rating'), r => r.rating + '/5'],
    [t('usable'), r => (r.usability_ok ? t('yes') : t('no'))], [t('commentCol'), r => r.comment || '–'], [t('date'), r => date(r.created_at)]];

  // title, explanation, columns, optional summary
  const cfg = {
    registered: [t('k_registered'), t('kd_registered'), learnerCols],
    female: [t('k_female'), t('kd_female'), learnerCols],
    youth: [t('k_youth'), t('kd_youth'), learnerCols],
    disability: [t('k_dis'), t('kd_disability'), learnerCols],
    enrolments: [t('k_enrol'), t('kd_enrolments'), enrolCols],
    completion: [t('k_completion'), t('kd_completion'), enrolCols],
    baseline: [t('k_baseline'), t('kd_baseline'), [[t('learner'), who], [t('course'), course], [t('starter'), r => (r.pre === null ? <span className="pill open">{t('noBaseline')}</span> : r.pre + '%')], [t('status'), status]]],
    gain: [t('k_gain'), t('kd_gain'), [[t('learner'), who], [t('course'), course], [t('starter'), r => pc(r.pre)], [t('firstFinal'), r => pc(r.first_post)],
      [t('gainCol'), r => <b className={r.gain >= 0 ? 'good' : 'bad'}>{(r.gain > 0 ? '+' : '') + r.gain} pts</b>]]],
    certificates: [t('k_certs'), t('kd_certificates'), [[t('id'), r => <Link to={`/verify/${r.certificate_no}`}>{r.certificate_no}</Link>], [t('learner'), who], [t('course'), course], [t('date'), r => date(r.issued_at)]]],
    usability: [t('k_usable'), t('kd_feedback'), feedbackCols],
    rating: [t('k_rating'), t('kd_feedback'), feedbackCols],
    help: [t('k_help'), t('kd_help'), [[t('learner'), who], [t('course'), course], [t('questionCol'), r => r.last_message], [t('date'), r => date(r.updated_at)]]]
  }[key];

  if (!cfg) return <p>{t('notFound')}</p>;
  const [title, explain, cols] = cfg;

  // Short summary line for the percentage indicators
  let summary = null;
  if (rows) {
    if (key === 'completion') summary = `${rows.filter(r => r.status === 'certified').length} / ${rows.length} ${t('es_certified').toLowerCase()}`;
    if (key === 'baseline') summary = `${rows.filter(r => r.pre !== null).length} / ${rows.length}`;
    if (key === 'usability') summary = `${rows.filter(r => r.usability_ok).length} / ${rows.length}`;
    if (key === 'rating' && rows.length) summary = `${(rows.reduce((a, r) => a + r.rating, 0) / rows.length).toFixed(1)} / 5`;
    if (key === 'gain' && rows.length) summary = `${Math.round(rows.reduce((a, r) => a + r.gain, 0) / rows.length)} pts (n=${rows.length})`;
  }
  // Completion and baseline lists show the "missing" ones first, so supervisors can follow up
  const shown = rows && (key === 'completion' ? [...rows].sort((a, b) => (a.status === 'certified') - (b.status === 'certified'))
    : key === 'baseline' ? [...rows].sort((a, b) => (a.pre !== null) - (b.pre !== null)) : rows);

  return (
    <>
      <p><Link to="/supervise">← {t('back')}</Link></p>
      <h1>{title}</h1>
      <p style={{ maxWidth: '65ch' }}>{explain}</p>
      {summary && <div className="kpi" style={{ maxWidth: 280, margin: '12px 0 20px' }}><b>{summary}</b></div>}
      {err && <div className="error">{err}</div>}
      {rows === null ? <p>{t('loading')}</p> : rows.length === 0 ? <p>{t('noRecords')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr>{cols.map(([h]) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{shown.map((r, i) => <tr key={i}>{cols.map(([h, f]) => <td key={h}>{f(r)}</td>)}</tr>)}</tbody>
        </table></div>
      )}
      {key === 'help' && <p><Link className="btn" to="/supervise#help">{t('helpQueue')} →</Link></p>}
    </>
  );
}
