import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

export default function Home() {
  const { t, pick, user } = useApp();
  const [courses, setCourses] = useState([]);
  useEffect(() => { api('/courses').then(setCourses).catch(() => {}); }, []);
  return (
    <>
      <section className="hero">
        <h1>{t('tagline')}</h1>
        <p>{t('heroText')}</p>
        <div className="row">
          {!user && <Link className="btn maize" to="/register">{t('getStarted')}</Link>}
          <Link className="btn ghost" to="/courses">{t('browse')}</Link>
        </div>
      </section>
      <section className="block">
        <h2>{t('howItWorks')}</h2>
        <ol className="steps">
          {['s1', 's2', 's3', 's4', 's5'].map(k => <li key={k}>{t(k)}</li>)}
        </ol>
      </section>
      <section className="block">
        <h2>{t('courses')}</h2>
        <div className="grid">
          {courses.map(c => (
            <article className="card" key={c.id}>
              <h3>{pick(c, 'title')}</h3>
              <p>{pick(c, 'description')}</p>
              <Link className="btn ghost" to={`/courses/${c.id}`}>{t('start')}</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
