import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

// Tiny renderer: paragraphs and "- " bullet lists (React escapes everything)
function Body({ text }) {
  return text.split(/\n\n+/).map((block, i) => {
    const lines = block.split('\n');
    if (lines.every(l => l.startsWith('- ')))
      return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
    return <p key={i}>{block}</p>;
  });
}

// YouTube links play in an embedded player (needs internet). Anything else plays as a normal video:
// for offline pilots put .mp4 files in client/public/videos/ and use a link like /videos/lesson1.mp4
function VideoPlayer({ url }) {
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (yt)
    return (
      <div className="video">
        <iframe src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} title="Lesson video" allowFullScreen loading="lazy" />
      </div>
    );
  return <video className="video" controls preload="none" src={url} />;
}

export default function Lesson() {
  const { id } = useParams();
  const { t, pick, hasSo, lang, user } = useApp();
  const nav = useNavigate();
  const [l, setL] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { setL(null); api('/lessons/' + id).then(setL).catch(e => setErr(e.message)); window.scrollTo(0, 0); }, [id]);

  if (err) return <div className="error">{err}</div>;
  if (!l) return <p>{t('loading')}</p>;

  const finish = async () => {
    await api(`/lessons/${id}/complete`, { method: 'POST' });
    nav(l.next_id ? `/lessons/${l.next_id}` : `/courses/${l.course_id}`);
  };

  return (
    <>
      <p><Link to={`/courses/${l.course_id}`}>← {t('backToCourse')}</Link></p>
      <h1>{pick(l, 'title')}</h1>
      {lang === 'so' && !hasSo(l, 'body') && <p className="note">{t('notTranslated')}</p>}
      <div className="lesson-body"><Body text={pick(l, 'body')} /></div>
      {l.video_url && <VideoPlayer url={l.video_url} />}
      <div className="nav-row">
        {l.prev_id && <Link className="btn ghost" to={`/lessons/${l.prev_id}`}>{t('prev')}</Link>}
        {user && user.role === 'supervisor'
          ? l.next_id && <Link className="btn" to={`/lessons/${l.next_id}`}>{t('next')}</Link>
          : <button className="btn maize" onClick={finish}>{l.completed ? t('next') : t('completeLesson')}</button>}
      </div>
    </>
  );
}