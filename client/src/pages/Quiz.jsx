import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, downloadPdf } from '../api';
import { useApp } from '../context';

export default function Quiz() {
  const { id, kind } = useParams();
  const { t, pick, lang } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [firstLesson, setFirstLesson] = useState(null);

  useEffect(() => {
    setQuiz(null); setResult(null); setAnswers({}); setErr('');
    api(`/courses/${id}/quiz?kind=${kind}`).then(setQuiz).catch(e => setErr(e.message));
    api(`/courses/${id}`).then(c => setFirstLesson(c.lessons[0] ? c.lessons[0].id : null)).catch(() => {});
  }, [id, kind]);

  if (err) return <><div className="error">{err}</div><Link to={`/courses/${id}`}>← {t('backToCourse')}</Link></>;
  if (!quiz) return <p>{t('loading')}</p>;

  const submit = async e => {
    e.preventDefault(); setErr('');
    try { setResult(await api(`/courses/${id}/quiz/submit`, { method: 'POST', body: { kind, answers } })); window.scrollTo(0, 0); }
    catch (ex) { setErr(ex.message); }
  };

  if (result) return (
    <>
      <h1>{t('yourScore')}</h1>
      <div className="score">{result.score}%</div>
      <p>{result.correct}/{result.total}{result.kind === 'post' && ` · ${t('passMark')}: ${result.pass_mark}%`}</p>
      {result.kind === 'pre'
        ? <div className="ok">{t('pretestDone')}</div>
        : result.passed ? <div className="ok">{t('passed')}</div> : <div className="error">{t('notPassed')}</div>}
      <div className="nav-row">
        {result.passed && <button className="btn maize" onClick={() => downloadPdf(result.certificate_no).catch(e => setErr(e.message))}>{t('downloadCert')}</button>}
        {result.kind === 'pre' && firstLesson && <Link className="btn maize" to={`/lessons/${firstLesson}`}>{t('startLessons')}</Link>}
        <Link className="btn ghost" to={`/courses/${id}`}>{t('backToCourse')}</Link>
      </div>
    </>
  );

  return (
    <>
      <h1>{kind === 'pre' ? t('pretest') : t('finalQuiz')}</h1>
      {kind === 'pre' && <p>{t('pretestHelp')}</p>}
      {lang === 'so' && quiz.questions.some(q => !q.text_so || !q.options_so) && <p className="note">{t('notTranslated')}</p>}
      <form onSubmit={submit}>
        {quiz.questions.map((q, n) => (
          <fieldset className="q" key={q.id}>
            <legend>{n + 1}. {pick(q, 'text')}</legend>
            {(lang === 'so' && q.options_so ? q.options_so : q.options_en).map((o, i) => (
              <label key={i}>
                <input type="radio" name={'q' + q.id} required checked={answers[q.id] === i}
                  onChange={() => setAnswers({ ...answers, [q.id]: i })} />
                {o}
              </label>
            ))}
          </fieldset>
        ))}
        {err && <div className="error">{err}</div>}
        <button className="btn maize" type="submit">{t('submit')}</button>
      </form>
    </>
  );
}
