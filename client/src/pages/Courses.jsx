import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

export default function Courses() {
  const { t, pick, user } = useApp();
  const sup = user && user.role === 'supervisor';
  const [courses, setCourses] = useState(null);
  useEffect(() => { api('/courses').then(setCourses).catch(() => setCourses([])); }, []);
  if (!courses) return <p>{t('loading')}</p>;
  return (
    <>
      <h1>{t('courses')}</h1>
      <div className="grid">
        {courses.map(c => (
          <article className={'card' + (c.certified ? ' done' : '')} key={c.id}>
            <h3>{pick(c, 'title')}</h3>
            <p>{pick(c, 'description')}</p>
            <div className="meta">{c.lesson_count} {t('lessons')}{c.enrolled ? ` · ${c.completed_lessons}/${c.lesson_count}` : ''}</div>
            {sup
              ? <p className="nav-row" style={{ margin: '8px 0 0' }}>
                  <Link className="btn" to={`/supervise/courses/${c.id}`}>{t('monitorCourse')}</Link>
                  <Link className="btn ghost" to={`/courses/${c.id}`}>{t('viewContent')}</Link>
                </p>
              : <p><Link className="btn" to={`/courses/${c.id}`}>{c.enrolled ? t('continue') : t('start')}</Link></p>}
          </article>
        ))}
      </div>
    </>
  );
}
