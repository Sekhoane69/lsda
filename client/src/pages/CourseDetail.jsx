import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, downloadPdf } from '../api';
import { useApp } from '../context';

export default function CourseDetail() {
  const { id } = useParams();
  const { t, pick, hasSo, lang, user } = useApp();
  const sup = !!user && user.role === 'supervisor';
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/courses/' + id).then(setC).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [id, user]);

  if (err) return <div className="error">{err}</div>;
  if (!c) return <p>{t('loading')}</p>;
  const total = c.lessons.length, done = c.completed.length;
  const allDone = total > 0 && done >= total;
  const firstOpen = c.lessons.find(l => !c.completed.includes(l.id)) || c.lessons[0];

  const enroll = async () => {
    if (!user) return nav('/login');
    await api(`/courses/${id}/enroll`, { method: 'POST' });
    // Send new learners to the starter quiz first, so the baseline is measured before any lesson
    nav(!c.pre_locked ? `/courses/${id}/quiz/pre` : '/lessons/' + c.lessons[0].id);
  };

  return (
    <>
      <h1>{pick(c, 'title')}</h1>
      <p style={{ maxWidth: '60ch' }}>{pick(c, 'description')}</p>
      {lang === 'so' && !hasSo(c, 'description') && <p className="note">{t('notTranslated')}</p>}
      {sup && (
        <div className="note" style={{ margin: '16px 0' }}>
          {t('supContentNote')} <Link to={`/supervise/courses/${id}`}>{t('monitorCourse')} →</Link>
        </div>
      )}

      {user && c.enrolled && (
        <>
          <div className="progress" aria-label={`${done}/${total}`}><span style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
          <p>{done}/{total} {t('lessons')}</p>
        </>
      )}

      <ul className="lesson-list">
        {c.lessons.map(l => (
          <li key={l.id}>
            <span>{l.position}. {pick(l, 'title')}</span>
            {c.completed.includes(l.id)
              ? <span className="tick">✓ {t('completed')}</span>
              : <span />}
            {user ? <Link className="btn ghost" to={`/lessons/${l.id}`}>{sup ? t('view') : t('start')}</Link> : null}
          </li>
        ))}
      </ul>

      {!sup && <div className="row2">
        <div className="card">
          <h3>{t('pretest')}</h3>
          <p>{t('pretestHelp')}</p>
          {c.pre_score !== null && c.pre_score !== undefined && <p className="meta">{t('yourScore')}: {c.pre_score}%</p>}
          {c.pre_locked === 'done' && <p className="meta">✓ {t('pretestDoneNote')}</p>}
          {c.pre_locked === 'started' && <p className="meta">{t('pretestClosed')}</p>}
          {!c.pre_locked && <Link className="btn ghost" to={user ? `/courses/${id}/quiz/pre` : '/login'}>{t('takePretest')}</Link>}
        </div>
        <div className="card">
          <h3>{t('finalQuiz')}</h3>
          <p>{allDone ? `${t('passMark')}: 70%` : t('finalHelp')}</p>
          <p className="meta">{t('finalDifferent')}</p>
          <button className="btn" disabled={!allDone} onClick={() => nav(`/courses/${id}/quiz/post`)}>{t('takeFinal')}</button>
          {c.certificate && <p><button className="btn maize" onClick={() => downloadPdf(c.certificate).catch(e => setErr(e.message))}>{t('downloadCert')}</button></p>}
        </div>
      </div>}

      {!sup && !c.enrolled && <p style={{ marginTop: 24 }}><button className="btn maize" onClick={enroll}>{t('enroll')}</button></p>}
    </>
  );
}
