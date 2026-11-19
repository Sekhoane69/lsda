import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

export default function Dashboard() {
  const { t, pick, user } = useApp();
  const [courses, setCourses] = useState(null);
  const [fb, setFb] = useState({ rating: '', usability_ok: false, comment: '' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { api('/my/dashboard').then(d => setCourses(d.courses)).catch(e => setErr(e.message)); }, []);

  const send = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    try { await api('/feedback', { method: 'POST', body: fb }); setMsg(t('thanks')); setFb({ rating: '', usability_ok: false, comment: '' }); }
    catch (ex) { setErr(ex.message); }
  };

  if (!courses) return err ? <div className="error">{err}</div> : <p>{t('loading')}</p>;
  return (
    <>
      <h1>{t('dashboard')}</h1>
      <p>{user.full_name}</p>
      {courses.length === 0 && <p>{t('noCourses')} <Link to="/courses">{t('browse')}</Link></p>}
      <div className="grid">
        {courses.map(c => (
          <article className={'card' + (c.certificate_no ? ' done' : '')} key={c.id}>
            <h3>{pick(c, 'title')}</h3>
            <div className="progress"><span style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /></div>
            <div className="meta">{c.done}/{c.total} {t('lessons')}
              {c.pre_score !== null && ` · ${t('pretest')}: ${c.pre_score}%`}
              {c.post_score !== null && ` · ${t('finalQuiz')}: ${c.post_score}%`}
            </div>
            <p><Link className="btn ghost" to={`/courses/${c.id}`}>{t('continue')}</Link></p>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 24 }}><Link className="btn ghost" to="/help">{t('helpTitle')}</Link></p>
      <section className="block">
        <form className="panel" onSubmit={send}>
          <h2>{t('feedbackTitle')}</h2>
          <label htmlFor="r">{t('rating')}</label>
          <select id="r" value={fb.rating} onChange={e => setFb({ ...fb, rating: e.target.value })} required>
            <option value="">–</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="check"><input type="checkbox" checked={fb.usability_ok} onChange={e => setFb({ ...fb, usability_ok: e.target.checked })} />{t('usable')}</label>
          <label htmlFor="c">{t('comment')}</label>
          <textarea id="c" rows={3} maxLength={1000} value={fb.comment} onChange={e => setFb({ ...fb, comment: e.target.value })} />
          {msg && <div className="ok">{msg}</div>}{err && <div className="error">{err}</div>}
          <p><button className="btn" type="submit">{t('send')}</button></p>
        </form>
      </section>
    </>
  );
}
