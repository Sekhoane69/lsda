import { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../context';

const emptyCourse = { title_en: '', title_so: '', description_en: '', description_so: '', published: 1 };
const emptyLesson = { title_en: '', title_so: '', body_en: '', body_so: '', video_url: '' };
const emptyQ = { qset: 'post', text_en: '', text_so: '', options_en: ['', '', '', ''], options_so: ['', '', '', ''], correct_index: 0 };
const pad4 = a => [...(a || []), '', '', '', ''].slice(0, Math.max(4, (a || []).length));

// ---------- small editors ----------
function CourseForm({ value, onSave, submitLabel }) {
  const { t } = useApp();
  const [c, setC] = useState(value);
  useEffect(() => setC(value), [value]);
  const set = k => e => setC({ ...c, [k]: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(c); }}>
      <label>{t('titleEn')}</label><input type="text" required value={c.title_en} onChange={set('title_en')} />
      <label>{t('titleSo')}</label><input type="text" value={c.title_so || ''} onChange={set('title_so')} />
      <label>{t('descEn')}</label><textarea rows={2} required value={c.description_en} onChange={set('description_en')} />
      <label>{t('descSo')}</label><textarea rows={2} value={c.description_so || ''} onChange={set('description_so')} />
      {'id' in value && <label className="check"><input type="checkbox" checked={!!c.published} onChange={set('published')} />{t('published')}</label>}
      <p><button className="btn" type="submit">{submitLabel}</button></p>
    </form>
  );
}

function LessonForm({ value, onSave, onCancel, submitLabel }) {
  const { t } = useApp();
  const [l, setL] = useState(value);
  const set = k => e => setL({ ...l, [k]: e.target.value });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(l); }}>
      <label>{t('titleEn')}</label><input type="text" required value={l.title_en} onChange={set('title_en')} />
      <label>{t('titleSo')}</label><input type="text" value={l.title_so || ''} onChange={set('title_so')} />
      <div className="row2">
        <div><label>{t('bodyEn')}</label><textarea rows={8} required value={l.body_en} onChange={set('body_en')} /></div>
        <div><label>{t('bodySo')}</label><textarea rows={8} value={l.body_so || ''} onChange={set('body_so')} /></div>
      </div>
      <label>{t('video')}</label><input type="text" value={l.video_url || ''} onChange={set('video_url')} />
      <div className="nav-row" style={{ margin: '8px 0' }}>
        <button className="btn" type="submit">{submitLabel}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>{t('cancel')}</button>}
      </div>
    </form>
  );
}

function QuestionForm({ value, onSave, onCancel, submitLabel, name }) {
  const { t } = useApp();
  const [q, setQ] = useState({ ...value, options_en: pad4(value.options_en), options_so: pad4(value.options_so) });
  const setOpt = (lang, i) => e => { const a = [...q[lang]]; a[i] = e.target.value; setQ({ ...q, [lang]: a }); };
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(q); }}>
      <label>{t('qset')}</label>
      <select value={q.qset} onChange={e => setQ({ ...q, qset: e.target.value })}>
        <option value="pre">{t('qsetPre')}</option><option value="post">{t('qsetPost')}</option>
      </select>
      <label>{t('qEn')}</label><input type="text" required value={q.text_en} onChange={e => setQ({ ...q, text_en: e.target.value })} />
      <label>{t('qSo')}</label><input type="text" value={q.text_so || ''} onChange={e => setQ({ ...q, text_so: e.target.value })} />
      {q.options_en.map((o, i) => (
        <div className="opt-row" key={i}>
          <input type="radio" name={name} checked={Number(q.correct_index) === i} onChange={() => setQ({ ...q, correct_index: i })} aria-label={`Option ${i + 1} is correct`} />
          <input type="text" placeholder={`${t('optEn')} ${i + 1}`} value={o} onChange={setOpt('options_en', i)} />
          <input type="text" placeholder={`${t('optSo')} ${i + 1}`} value={q.options_so[i] || ''} onChange={setOpt('options_so', i)} />
        </div>
      ))}
      <p className="meta">{t('correctHelp')}</p>
      <div className="nav-row" style={{ margin: '8px 0' }}>
        <button className="btn" type="submit">{submitLabel}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>{t('cancel')}</button>}
      </div>
    </form>
  );
}

const MissingSo = ({ show }) => { const { t } = useApp(); return show ? <span className="pill open">{t('missingSo')}</span> : null; };

// ---------- page ----------
export default function Admin() {
  const { t, pick, user, date } = useApp();
  const [courses, setCourses] = useState([]);
  const [cid, setCid] = useState('');
  const [content, setContent] = useState(null);
  const [editing, setEditing] = useState(null);          // 'l12' or 'q34'
  const [users, setUsers] = useState([]);
  const [certs, setCerts] = useState([]);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  const loadCourses = () => api('/admin/courses').then(setCourses).catch(e => setErr(e.message));
  const loadContent = id => (id ? api('/admin/content/' + id).then(setContent).catch(e => setErr(e.message)) : setContent(null));
  const loadPeople = () => { api('/admin/users').then(setUsers); api('/admin/certificates').then(setCerts); };
  useEffect(() => { loadCourses(); loadPeople(); }, []);
  useEffect(() => { setEditing(null); loadContent(cid); }, [cid]);

  const run = async (fn, after) => {
    setMsg(''); setErr('');
    try { await fn(); setMsg(t('saved')); setEditing(null); after && after(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e) { setErr(e.message); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const refresh = () => { loadContent(cid); loadCourses(); };

  const pre = content ? content.questions.filter(q => q.qset === 'pre') : [];
  const post = content ? content.questions.filter(q => q.qset === 'post') : [];

  const questionBlock = (list, label) => (
    <>
      <h4>{label} ({list.length})</h4>
      <ol className="admin-list">{list.map(q => (
        <li key={q.id}>
          {editing === 'q' + q.id ? (
            <QuestionForm name={'q' + q.id} value={q} submitLabel={t('save')} onCancel={() => setEditing(null)}
              onSave={v => run(() => api('/admin/questions/' + q.id, { method: 'PUT', body: v }), refresh)} />
          ) : (
            <div className="admin-item">
              <span>{q.text_en} <MissingSo show={!q.text_so || !q.options_so} /></span>
              <span className="nav-row" style={{ margin: 0 }}>
                <button className="btn ghost" onClick={() => setEditing('q' + q.id)}>{t('edit')}</button>
                <button className="btn ghost" onClick={() => window.confirm(t('delete') + '?') && run(() => api('/admin/questions/' + q.id, { method: 'DELETE' }), refresh)}>{t('delete')}</button>
              </span>
            </div>
          )}
        </li>
      ))}</ol>
    </>
  );

  return (
    <>
      <h1>{t('manageTitle')}</h1>
      {msg && <div className="ok">{msg}</div>}{err && <div className="error">{err}</div>}

      {/* ----- Content ----- */}
      <h2>{t('content')}</h2>
      <div className="panel wide">
        <label htmlFor="cs">{t('chooseCourse')}</label>
        <select id="cs" value={cid} onChange={e => setCid(e.target.value)}>
          <option value="">–</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.module_no}. {pick(c, 'title')}</option>)}
        </select>

        {content && (
          <>
            <h3 style={{ marginTop: 20 }}>{content.course.title_en} <MissingSo show={!content.course.title_so || !content.course.description_so} /></h3>
            <CourseForm value={content.course} submitLabel={t('save')}
              onSave={v => run(() => api('/admin/courses/' + content.course.id, { method: 'PUT', body: v }), refresh)} />

            <h3>{t('lessonList')}</h3>
            <ol className="admin-list">{content.lessons.map(l => (
              <li key={l.id}>
                {editing === 'l' + l.id ? (
                  <LessonForm value={l} submitLabel={t('save')} onCancel={() => setEditing(null)}
                    onSave={v => run(() => api('/admin/lessons/' + l.id, { method: 'PUT', body: v }), refresh)} />
                ) : (
                  <div className="admin-item">
                    <span>{l.title_en} <MissingSo show={!l.title_so || !l.body_so} /></span>
                    <span className="nav-row" style={{ margin: 0 }}>
                      <button className="btn ghost" onClick={() => setEditing('l' + l.id)}>{t('edit')}</button>
                      <button className="btn ghost" onClick={() => window.confirm(t('delete') + '?') && run(() => api('/admin/lessons/' + l.id, { method: 'DELETE' }), refresh)}>{t('delete')}</button>
                    </span>
                  </div>
                )}
              </li>
            ))}</ol>
            <details>
              <summary className="btn ghost">{t('newLesson')}</summary>
              <LessonForm key={'nl' + content.lessons.length} value={emptyLesson} submitLabel={t('newLesson')}
                onSave={v => run(() => api('/admin/lessons', { method: 'POST', body: { ...v, course_id: content.course.id } }), refresh)} />
            </details>

            <h3 style={{ marginTop: 24 }}>{t('questionList')}</h3>
            {questionBlock(pre, t('qsetPre'))}
            {questionBlock(post, t('qsetPost'))}
            <details>
              <summary className="btn ghost">{t('newQuestion')}</summary>
              <QuestionForm key={'nq' + content.questions.length} name="newq" value={emptyQ} submitLabel={t('newQuestion')}
                onSave={v => run(() => api('/admin/questions', { method: 'POST', body: { ...v, course_id: content.course.id } }), refresh)} />
            </details>
          </>
        )}
      </div>

      <details className="panel wide" style={{ marginTop: 16 }}>
        <summary><strong>{t('newCourse')}</strong></summary>
        <CourseForm value={emptyCourse} submitLabel={t('addCourse')}
          onSave={v => run(() => api('/admin/courses', { method: 'POST', body: v }), loadCourses)} />
      </details>

      {/* ----- Users ----- */}
      <h2 style={{ marginTop: 40 }}>{t('users')}</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>{t('fullName')}</th><th>{t('contact')}</th><th>{t('role')}</th><th>{t('joined')}</th><th /></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id}>
            <td>{u.full_name}</td><td>{u.identifier}</td>
            <td>
              <select value={u.role} disabled={u.id === user.id} aria-label={t('role')}
                onChange={e => run(() => api(`/admin/users/${u.id}/role`, { method: 'PATCH', body: { role: e.target.value } }), loadPeople)}>
                {['learner', 'supervisor', 'admin'].map(r => <option key={r} value={r}>{t('r_' + r)}</option>)}
              </select>
            </td>
            <td>{date(u.created_at)}</td>
            <td className="nav-row" style={{ margin: 0 }}>
              <button className="btn ghost" onClick={() => {
                const pw = window.prompt(t('newPw'));
                if (pw) run(() => api(`/admin/users/${u.id}/password`, { method: 'POST', body: { password: pw } }));
              }}>{t('resetPw')}</button>
              {u.id !== user.id && <button className="btn ghost" onClick={() => window.confirm(t('deleteUserQ')) &&
                run(() => api('/admin/users/' + u.id, { method: 'DELETE' }), loadPeople)}>{t('delete')}</button>}
            </td>
          </tr>
        ))}</tbody>
      </table></div>

      {/* ----- Certificates ----- */}
      <h2 style={{ marginTop: 40 }}>{t('certsCol')}</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>{t('id')}</th><th>{t('learner')}</th><th>{t('course')}</th><th>{t('status')}</th><th /></tr></thead>
        <tbody>{certs.map(c => (
          <tr key={c.certificate_no}><td>{c.certificate_no}</td><td>{c.full_name}</td><td>{c.title_en}</td><td>{c.status}</td>
            <td>{c.status === 'valid' && <button className="btn ghost" onClick={() => run(() => api(`/admin/certificates/${c.certificate_no}/revoke`, { method: 'POST' }), loadPeople)}>{t('revoke')}</button>}</td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
