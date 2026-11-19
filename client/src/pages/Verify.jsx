import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context';

export default function Verify() {
  const { no } = useParams();
  const { t } = useApp();
  const nav = useNavigate();
  const [input, setInput] = useState(no || '');
  const [res, setRes] = useState(null);
  useEffect(() => {
    setRes(null);
    if (no) api('/certificates/verify/' + encodeURIComponent(no)).then(setRes).catch(() => setRes({ found: false }));
  }, [no]);
  return (
    <>
      <h1>{t('verifyTitle')}</h1>
      <form className="panel" onSubmit={e => { e.preventDefault(); if (input.trim()) nav('/verify/' + encodeURIComponent(input.trim())); }}>
        <label htmlFor="no">{t('certNo')}</label>
        <input id="no" type="text" placeholder="LSDA-2026-00001" value={input} onChange={e => setInput(e.target.value)} />
        <p><button className="btn" type="submit">{t('check')}</button></p>
      </form>
      {res && (res.found
        ? <div className={res.status === 'valid' ? 'ok' : 'error'} style={{ maxWidth: 520 }}>
            <strong>{res.status === 'valid' ? '✓ ' + t('validCert') : t('revokedCert')}</strong>
            <div>{res.name}</div><div>{res.course}</div>
            <div>{res.certificate_no} · {new Date(res.issued_at).toLocaleDateString()}</div>
          </div>
        : <div className="error" style={{ maxWidth: 520 }}>{t('notFound')}</div>)}
    </>
  );
}
