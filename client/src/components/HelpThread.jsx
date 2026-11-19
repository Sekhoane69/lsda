import { useState } from 'react';
import { api } from '../api';
import { useApp } from '../context';

// One help request: its messages, a reply box and close / re-open. Used by learners and supervisors.
export default function HelpThread({ req, onChange, staffView = false }) {
  const { t, pick, user, date } = useApp();
  const [reply, setReply] = useState('');
  const [err, setErr] = useState('');
  const send = async e => {
    e.preventDefault(); setErr('');
    try { await api(`/help/${req.id}/messages`, { method: 'POST', body: { message: reply } }); setReply(''); onChange(); }
    catch (ex) { setErr(ex.message); }
  };
  const setStatus = async status => {
    try { await api(`/help/${req.id}`, { method: 'PATCH', body: { status } }); onChange(); } catch (ex) { setErr(ex.message); }
  };
  const who = m => (m.sender_id === user.id ? t('you')
    : m.sender_role === 'learner' ? (m.sender_name || t('learner'))
    : `${m.sender_name || ''} (${t('supervisorWord')})`);

  return (
    <article className={'thread st-' + req.status}>
      <header>
        <strong>{staffView ? req.full_name : (req.title_en ? pick(req, 'title') : t('helpAny'))}</strong>
        <span className={'pill ' + req.status}>{t('st_' + req.status)}</span>
      </header>
      {staffView && <div className="meta">{req.identifier} · {req.title_en ? pick(req, 'title') : t('helpAny')}</div>}
      <ul className="msgs">
        {(req.messages || []).map(m => (
          <li key={m.id} className={m.sender_id === user.id ? 'mine' : ''}>
            <div className="meta">{who(m)} · {date(m.created_at)}</div>
            <div className="body">{m.body}</div>
          </li>
        ))}
      </ul>
      {req.status !== 'closed' && (
        <form onSubmit={send}>
          <label htmlFor={'r' + req.id}>{t('reply')}</label>
          <textarea id={'r' + req.id} rows={2} maxLength={1000} required value={reply} onChange={e => setReply(e.target.value)} />
          <div className="nav-row" style={{ margin: '8px 0 0' }}>
            <button className="btn" type="submit">{t('sendReply')}</button>
            <button className="btn ghost" type="button" onClick={() => setStatus('closed')}>{t('close')}</button>
          </div>
        </form>
      )}
      {req.status === 'closed' && <button className="btn ghost" onClick={() => setStatus('open')}>{t('reopen')}</button>}
      {err && <div className="error">{err}</div>}
    </article>
  );
}
