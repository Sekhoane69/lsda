import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, downloadPdf } from '../api';
import { useApp } from '../context';

export default function Certificates() {
  const { t, pick } = useApp();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/certificates/mine').then(setRows).catch(e => setErr(e.message)); }, []);
  if (!rows) return err ? <div className="error">{err}</div> : <p>{t('loading')}</p>;
  return (
    <>
      <h1>{t('certificates')}</h1>
      {err && <div className="error">{err}</div>}
      {rows.length === 0 && <p>{t('noCerts')} <Link to="/courses">{t('browse')}</Link></p>}
      {rows.map(r => (
        <div className="cert" key={r.certificate_no}>
          <div>
            <h3>{pick(r, 'title')}</h3>
            <div className="meta">{r.certificate_no} · {new Date(r.issued_at).toLocaleDateString()}{r.status !== 'valid' && ` · ${t('revokedCert')}`}</div>
          </div>
          <div className="nav-row" style={{ margin: 0 }}>
            {r.status === 'valid' && <button className="btn maize" onClick={() => downloadPdf(r.certificate_no).catch(e => setErr(e.message))}>{t('downloadCert')}</button>}
            <Link className="btn ghost" to={`/verify/${r.certificate_no}`}>{t('verify')}</Link>
          </div>
        </div>
      ))}
    </>
  );
}
