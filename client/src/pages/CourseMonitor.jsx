import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

// Supervisor view of one course: where learners stop, and how each learner is doing
export default function CourseMonitor() {
  const { id } = useParams();
  const { t, pick, date } = useApp();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/staff/courses/' + id).then(setD).catch(e => setErr(e.message)); }, [id]);
  if (err) return <div className="error">{err}</div>;
  if (!d) return <p>{t('loading')}</p>;

  const n = d.learners.length;
  const pc = v => (v === null || v === undefined ? '–' : v + '%');
  const count = s => d.learners.filter(r => r.status === s).length;
  const avg = a => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) + '%' : '–');

  return (
    <>
      <p><Link to="/supervise">← {t('back')}</Link></p>
      <h1>{pick(d.course, 'title')}</h1>
      <p className="nav-row" style={{ margin: '0 0 16px' }}><Link className="btn ghost" to={`/courses/${id}`}>{t('viewContent')}</Link></p>

      <div className="kpis">
        <div className="kpi"><b>{n}</b><span>{t('enrolledCol')}</span></div>
        <div className="kpi"><b>{count('not_started')}</b><span>{t('es_not_started')}</span></div>
        <div className="kpi"><b>{count('in_progress')}</b><span>{t('es_in_progress')}</span></div>
        <div className="kpi"><b>{count('lessons_done')}</b><span>{t('es_lessons_done')}</span></div>
        <div className="kpi"><b>{count('certified')}</b><span>{t('es_certified')}</span></div>
        <div className="kpi"><b>{avg(d.learners.filter(r => r.pre !== null).map(r => r.pre))}</b><span>{t('avgPre')}</span></div>
        <div className="kpi"><b>{avg(d.learners.filter(r => r.first_post !== null).map(r => r.first_post))}</b><span>{t('avgPost')}</span></div>
      </div>

      <h2 style={{ marginTop: 32 }}>{t('lessonReach')}</h2>
      <p className="meta">{t('lessonReachHelp')}</p>
      <ol className="bars" style={{ paddingLeft: '1.4em' }}>
        {d.lessons.map(l => (
          <li key={l.id}>
            <span>{pick(l, 'title')}</span>
            <span className="bar"><span style={{ width: `${n ? (l.completed / n) * 100 : 0}%` }} /></span>
            <span>{l.completed}/{n}</span>
          </li>
        ))}
      </ol>

      <h2 style={{ marginTop: 32 }}>{t('learners')}</h2>
      {n === 0 ? <p>{t('noLearners')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>{t('learner')}</th><th>{t('contact')}</th><th>{t('progress')}</th><th>{t('starter')}</th><th>{t('firstFinal')}</th>
            <th>{t('bestFinal')}</th><th>{t('attempts')}</th><th>{t('status')}</th><th>{t('lastActive')}</th></tr></thead>
          <tbody>{d.learners.map(r => (
            <tr key={r.user_id}>
              <td><Link to={`/supervise/learners/${r.user_id}`}>{r.full_name}</Link></td><td>{r.identifier}</td>
              <td><div className="progress small"><span style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} /></div>{r.done}/{r.total}</td>
              <td>{pc(r.pre)}</td><td>{pc(r.first_post)}</td><td>{pc(r.best_post)}</td><td>{r.post_attempts}</td>
              <td><span className={'pill ' + (r.status === 'certified' ? 'answered' : r.status === 'not_started' ? 'closed' : 'open')}>{t('es_' + r.status)}</span></td>
              <td>{date(r.last_lesson_at || r.enrolled_at)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}

      <h2 style={{ marginTop: 32 }}>{t('helpQueue')}</h2>
      {d.help.length === 0 ? <p>{t('noHelp')}</p> : (
        <ul>{d.help.map(h => <li key={h.id}>{h.full_name} · <span className={'pill ' + h.status}>{t('st_' + h.status)}</span> · {date(h.updated_at)}</li>)}</ul>
      )}
      <p><Link className="btn ghost" to="/supervise#help">{t('helpQueue')} →</Link></p>
    </>
  );
}
