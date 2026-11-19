import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

// Supervisor view of one learner: how they are doing in each course
export default function LearnerDetail() {
  const { id } = useParams();
  const { t, pick, date } = useApp();
  const [l, setL] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const resetPw = async () => {
    const pw = window.prompt(t('newPw'));
    if (!pw) return;
    setErr(''); setMsg('');
    try { await api(`/staff/learners/${id}/password`, { method: 'POST', body: { password: pw } }); setMsg(t('pwResetDone')); }
    catch (ex) { setErr(ex.message); }
  };
  useEffect(() => { api('/staff/learners/' + id).then(setL).catch(e => setErr(e.message)); }, [id]);
  if (err && !l) return <div className="error">{err}</div>;
  if (!l) return <p>{t('loading')}</p>;
  const pc = v => (v === null || v === undefined ? '–' : v + '%');
  return (
    <>
      <p><Link to="/supervise">← {t('back')}</Link></p>
      <h1>{l.full_name}</h1>
      <p className="meta">
        {l.identifier} · {t(l.gender)} · {l.age_group ? t(l.age_group) : '–'} · {t('joined')}: {date(l.created_at)}
      </p>
      <p className="nav-row" style={{ margin: '0 0 16px' }}><button className="btn ghost" onClick={resetPw}>{t('resetPw')}</button></p>
      {msg && <div className="ok">{msg}</div>}
      {err && <div className="error">{err}</div>}
      {l.courses.length === 0 ? <p>{t('notStarted')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>{t('course')}</th><th>{t('progress')}</th><th>{t('starter')}</th><th>{t('firstFinal')}</th>
            <th>{t('bestFinal')}</th><th>{t('attempts')}</th><th>{t('certificate')}</th><th>{t('lastActive')}</th></tr></thead>
          <tbody>{l.courses.map(c => (
            <tr key={c.id}>
              <td>{pick(c, 'title')}</td>
              <td><div className="progress small"><span style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /></div>{c.done}/{c.total}</td>
              <td>{pc(c.pre)}</td><td>{pc(c.first_post)}</td><td>{pc(c.best_post)}</td><td>{c.post_attempts}</td>
              <td>{c.certificate_no || '–'}</td><td>{date(c.last_lesson_at || c.enrolled_at)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <h2 style={{ marginTop: 32 }}>{t('helpQueue')}</h2>
      {l.help.length === 0 ? <p>{t('noHelp')}</p>
        : <ul>{l.help.map(h => <li key={h.id}>#{h.id} · <span className={'pill ' + h.status}>{t('st_' + h.status)}</span> · {date(h.updated_at)}</li>)}</ul>}
      <p><Link className="btn ghost" to="/supervise">{t('helpQueue')}</Link></p>
    </>
  );
}
