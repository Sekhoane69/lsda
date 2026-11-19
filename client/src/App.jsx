import { Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from './context';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import { Login, Register, ForgotPassword } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import Help from './pages/Help';
import MyData from './pages/MyData';
import Supervise from './pages/Supervise';
import LearnerDetail from './pages/LearnerDetail';
import KpiDetail from './pages/KpiDetail';
import CourseMonitor from './pages/CourseMonitor';

// roles = who may open the page; learnerPage = supervisors are sent to their own page instead
function Private({ children, roles, learnerPage }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  const home = user.role === 'learner' ? '/dashboard' : '/supervise';
  if (roles && !roles.includes(user.role)) return <Navigate to={home} replace />;
  if (learnerPage && user.role === 'supervisor') return <Navigate to="/supervise" replace />;
  return children;
}

export default function App() {
  const { user, t, lang, setLang, logout, isStaff } = useApp();
  const nav = useNavigate();
  return (
    <>
      <div className="band" aria-hidden="true" />
      <header className="top">
        <Link to="/" className="brand">Lesotho Digital Skills Academy</Link>
        <nav>
          <NavLink to="/courses">{t('courses')}</NavLink>
          {user && user.role !== 'supervisor' && <NavLink to="/dashboard">{t('dashboard')}</NavLink>}
          {user && user.role !== 'supervisor' && <NavLink to="/certificates">{t('certificates')}</NavLink>}
          {user && !isStaff && <NavLink to="/help">{t('help')}</NavLink>}
          <NavLink to="/verify">{t('verify')}</NavLink>
          {isStaff && <NavLink to="/supervise">{t('supervise')}</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">{t('admin')}</NavLink>}
          {user && <NavLink to="/my-data">{t('myData')}</NavLink>}
        </nav>
        <div className="actions">
          <div className="lang" role="group" aria-label={t('language')}>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'so' ? 'on' : ''} onClick={() => setLang('so')}>SO</button>
          </div>
          {user
            ? <button className="btn ghost" onClick={() => { logout(); nav('/'); }}>{t('logout')}</button>
            : <><Link className="btn ghost" to="/login">{t('login')}</Link><Link className="btn" to="/register">{t('register')}</Link></>}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/lessons/:id" element={<Private><Lesson /></Private>} />
          <Route path="/courses/:id/quiz/:kind" element={<Private learnerPage><Quiz /></Private>} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Private learnerPage><Dashboard /></Private>} />
          <Route path="/certificates" element={<Private learnerPage><Certificates /></Private>} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:no" element={<Verify />} />
          <Route path="/help" element={<Private learnerPage><Help /></Private>} />
          <Route path="/my-data" element={<Private><MyData /></Private>} />
          <Route path="/supervise" element={<Private roles={['supervisor', 'admin']}><Supervise /></Private>} />
          <Route path="/supervise/kpi/:key" element={<Private roles={['supervisor', 'admin']}><KpiDetail /></Private>} />
          <Route path="/supervise/courses/:id" element={<Private roles={['supervisor', 'admin']}><CourseMonitor /></Private>} />
          <Route path="/supervise/learners/:id" element={<Private roles={['supervisor', 'admin']}><LearnerDetail /></Private>} />
          <Route path="/admin" element={<Private roles={['admin']}><Admin /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer><div className="band" aria-hidden="true" /><p>{t('disclaimer')}</p></footer>
    </>
  );
}
