import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, downloadFile } from '../api';
import { useApp } from '../context';
import HelpThread from '../components/HelpThread';

// Each indicator is a link to the records behind it
export const KPI = ({ v, label, suffix = '', k }) => {
  const { t } = useApp();
  return (
    <Link className="kpi kpi-link" to={`/supervise/kpi/${k}`}>
      <b>{v === null || v === undefined ? '–' : v + suffix}</b><span>{label}</span>
      <small className="kpi-more">{t('viewRecords')} →</small>
    </Link>
  );
};

// Supervisor home: M&E indicators, every learner's progress, and the help-request queue
export default function Supervise() {
  const { t, date } = useApp();
  const { pick } = useApp();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState(null);
  const [pwReqs, setPwReqs] = useState([]);
  const [msg, setMsg] = useState('');
  const [learners, setLearners] = useState(null);
  const [help, setHelp] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [thread, setThread] = useState(null);
  const [filter, setFilter] = useState('active');
  const [err, setErr] = useState('');

  const loadHelp = () => api('/help').then(setHelp).catch(e => setErr(e.message));
  const load = () => {
    api('/staff/stats').then(setStats).catch(e => setErr(e.message));
    api('/staff/courses').then(setCourses).catch(e => setErr(e.message));
    api('/staff/password-requests').then(setPwReqs).catch(() => {});
    api('/staff/learners').then(setLearners).catch(e => setErr(e.message));
    loadHelp();
  };
  useEffect(load, []);

  const openThread = id => {
    if (openId === id) { setOpenId(null); setThread(null); return; }
    setOpenId(id); api('/help/' + id).then(setThread).catch(e => setErr(e.message));
  };
  const refreshThread = () => { loadHelp(); api('/staff/stats').then(setStats); if (openId) api('/help/' + openId).then(setThread); };

  // Set a temporary password after checking the learner's identity in person
  const resetPw = async (id, name) => {
    const pw = window.prompt(`${t('newPw')}\n${name}`);
    if (!pw) return;
    setMsg(''); setErr('');
    try {
      await api(`/staff/learners/${id}/password`, { method: 'POST', body: { password: pw } });
      setMsg(t('pwResetDone'));
      api('/staff/password-requests').then(setPwReqs).catch(() => {});
    } catch (ex) { setErr(ex.message); }
  };
  const daysAgo = d => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  const shownHelp = (help || []).filter(h => filter === 'all' || h.status !== 'closed');

  return (
    <>
      <h1>{t('superviseTitle')}</h1>
      {err && <div className="error">{err}</div>}

      <h2>{t('kpiTitle')}</h2>
      {stats && (
        <div className="kpis">
          <KPI k="registered" v={stats.registered} label={t('k_registered')} />
          <KPI k="enrolments" v={stats.enrolments} label={t('k_enrol')} />
          <KPI k="certificates" v={stats.certificates} label={t('k_certs')} />
          <KPI k="completion" v={stats.completion_pct} suffix="%" label={t('k_completion')} />
          <KPI k="gain" v={stats.skills_gain_points} suffix=" pts" label={`${t('k_gain')} (n=${stats.skills_gain_sample})`} />
          <KPI k="baseline" v={stats.baseline_pct} suffix="%" label={t('k_baseline')} />
          <KPI k="female" v={stats.female_pct} suffix="%" label={t('k_female')} />
          <KPI k="youth" v={stats.youth_pct} suffix="%" label={t('k_youth')} />
          <KPI k="disability" v={stats.disability_count} label={t('k_dis')} />
          <KPI k="usability" v={stats.usability_pct} suffix="%" label={`${t('k_usable')} (n=${stats.feedback_count})`} />
          <KPI k="rating" v={stats.avg_rating} label={t('k_rating')} />
          <KPI k="help" v={stats.help_open} label={t('k_help')} />
        </div>
      )}
      <p><button className="btn ghost" onClick={() => downloadFile('/staff/export.csv', 'lsda-me-data.csv').catch(e => setErr(e.message))}>{t('exportCsv')}</button></p>

      <p className="meta">{t('kpiClickHint')}</p>

      {msg && <div className="ok" style={{ marginTop: 16 }}>{msg}</div>}
      {pwReqs.length > 0 && (
        <section className="panel wide" style={{ marginTop: 24 }}>
          <h2>{t('pwRequests')}</h2>
          <p className="meta">{t('pwRequestsHelp')}</p>
          <div className="table-wrap"><table>
            <thead><tr><th>{t('learner')}</th><th>{t('contact')}</th><th>{t('date')}</th><th /></tr></thead>
            <tbody>{pwReqs.map(r => (
              <tr key={r.id} className="attn">
                <td>{r.full_name}</td><td>{r.identifier}</td><td>{date(r.created_at)}</td>
                <td><button className="btn ghost" onClick={() => resetPw(r.user_id, r.full_name)}>{t('resetPw')}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </section>
      )}

      <h2 style={{ marginTop: 40 }}>{t('courseMonitoring')}</h2>
      {courses === null ? <p>{t('loading')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>{t('course')}</th><th>{t('enrolledCol')}</th><th>{t('inProgress')}</th><th>{t('certsCol')}</th>
            <th>{t('completionCol')}</th><th>{t('avgPre')}</th><th>{t('avgPost')}</th><th>{t('gainCol')}</th><th>{t('openHelp')}</th><th /></tr></thead>
          <tbody>{courses.map(c => {
            const pc = v => (v === null ? '–' : v + '%');
            return (
              <tr key={c.id} className={c.help_open > 0 ? 'attn' : ''}>
                <td>{c.module_no}. <Link to={`/supervise/courses/${c.id}`}>{pick(c, 'title')}</Link></td>
                <td>{c.enrolled}</td><td>{c.in_progress}</td><td>{c.certified}</td><td>{pc(c.completion_pct)}</td>
                <td>{pc(c.avg_pre)}</td><td>{pc(c.avg_first_post)}</td>
                <td>{c.avg_gain === null ? '–' : (c.avg_gain > 0 ? '+' : '') + c.avg_gain + ' pts'}</td>
                <td>{c.help_open}</td>
                <td><Link className="btn ghost" to={`/supervise/courses/${c.id}`}>{t('view')}</Link></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}

      <h2 style={{ marginTop: 40 }} id="help">{t('helpQueue')}</h2>
      <div className="lang" role="group" style={{ marginBottom: 12 }}>
        <button className={filter === 'active' ? 'on' : ''} onClick={() => setFilter('active')}>{t('st_open')} / {t('st_answered')}</button>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>{t('st_closed')} +</button>
      </div>
      {help === null ? <p>{t('loading')}</p> : shownHelp.length === 0 ? <p>{t('noHelp')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>{t('learner')}</th><th>{t('course')}</th><th>{t('questionCol')}</th><th>{t('status')}</th><th /></tr></thead>
          <tbody>{shownHelp.map(h => (
            <tr key={h.id} className={h.status === 'open' ? 'attn' : ''}>
              <td>{h.full_name}</td><td>{h.title_en || t('helpAny')}</td>
              <td className="clip">{h.last_message}</td>
              <td><span className={'pill ' + h.status}>{t('st_' + h.status)}</span></td>
              <td><button className="btn ghost" onClick={() => openThread(h.id)}>{openId === h.id ? t('close') : t('reply')}</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {thread && openId === thread.id && <HelpThread req={thread} onChange={refreshThread} staffView />}

      <h2 style={{ marginTop: 40 }}>{t('learners')}</h2>
      {learners === null ? <p>{t('loading')}</p> : learners.length === 0 ? <p>{t('noLearners')}</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>{t('learner')}</th><th>{t('contact')}</th><th>{t('progress')}</th><th>{t('certsCol')}</th>
            <th>{t('avgPre')}</th><th>{t('avgPost')}</th><th>{t('lastActive')}</th><th>{t('openHelp')}</th><th /></tr></thead>
          <tbody>{learners.map(l => {
            const pct = l.lessons_total ? Math.round((l.lessons_done / l.lessons_total) * 100) : 0;
            // Flag learners who have an open question, or who joined a course but have not been active for 7+ days
            const attn = l.help_open > 0 || (l.courses > 0 && pct < 100 && daysAgo(l.last_active) >= 7);
            return (
              <tr key={l.id} className={attn ? 'attn' : ''}>
                <td>{l.full_name}{attn && <span className="pill open" style={{ marginLeft: 6 }}>{t('needsHelp')}</span>}</td>
                <td>{l.identifier}</td>
                <td>{l.courses === 0 ? t('notStarted') : <><div className="progress small"><span style={{ width: pct + '%' }} /></div>{l.lessons_done}/{l.lessons_total}</>}</td>
                <td>{l.certificates}</td>
                <td>{l.avg_pre === null ? '–' : l.avg_pre + '%'}</td>
                <td>{l.avg_first_post === null ? '–' : l.avg_first_post + '%'}</td>
                <td>{date(l.last_active)}</td>
                <td>{l.help_open}</td>
                <td><Link className="btn ghost" to={`/supervise/learners/${l.id}`}>{t('view')}</Link></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
    </>
  );
}
