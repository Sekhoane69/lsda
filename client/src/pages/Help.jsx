import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../context';
import HelpThread from '../components/HelpThread';

export default function Help() {
  const { t, pick } = useApp();
  const [courses, setCourses] = useState([]);
  const [mine, setMine] = useState(null);
  const [f, setF] = useState({ course_id: '', message: '' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const load = () => api('/help/mine').then(setMine).catch(e => setErr(e.message));
  useEffect(() => { load(); api('/courses').then(setCourses).catch(() => {}); }, []);

  const send = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    try { await api('/help', { method: 'POST', body: f }); setF({ course_id: '', message: '' }); setMsg(t('saved')); load(); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <>
      <h1>{t('helpTitle')}</h1>
      <p style={{ maxWidth: '60ch' }}>{t('helpIntro')}</p>
      <form className="panel" onSubmit={send}>
        <label htmlFor="hc">{t('helpCourse')}</label>
        <select id="hc" value={f.course_id} onChange={e => setF({ ...f, course_id: e.target.value })}>
          <option value="">{t('helpAny')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{pick(c, 'title')}</option>)}
        </select>
        <label htmlFor="hm">{t('helpMessage')}</label>
        <textarea id="hm" rows={4} maxLength={1000} required value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
        {msg && <div className="ok">{msg}</div>}{err && <div className="error">{err}</div>}
        <p><button className="btn maize" type="submit">{t('helpSend')}</button></p>
      </form>

      <h2 style={{ marginTop: 32 }}>{t('helpMine')}</h2>
      {mine === null ? <p>{t('loading')}</p> : mine.length === 0 ? <p>{t('helpNone')}</p>
        : mine.map(r => <HelpThread key={r.id} req={r} onChange={load} />)}
    </>
  );
}
