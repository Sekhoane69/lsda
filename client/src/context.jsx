import { createContext, useContext, useEffect, useState } from 'react';
import { dict } from './i18n';
import { api } from './api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en');

  const t = k => dict[lang][k] || dict.en[k] || k;
  // Show the Sesotho field when it exists, otherwise fall back to English
  const pick = (o, f) => (lang === 'so' && o[f + '_so']) ? o[f + '_so'] : o[f + '_en'];
  const hasSo = (o, f) => !!o[f + '_so'];
  const setLang = l => { localStorage.setItem('lang', l); document.documentElement.lang = l === 'so' ? 'st' : 'en'; setLangState(l); };
  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  const date = d => (d ? new Date(d).toLocaleDateString(lang === 'so' ? 'en-GB' : 'en-GB') : '–');

  // Refresh the account on load: picks up role changes and logs out deleted accounts
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me')
      .then(u => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); })
      .catch(e => { if (e.status === 401) logout(); });
  }, []);
  useEffect(() => { document.documentElement.lang = lang === 'so' ? 'st' : 'en'; }, [lang]);

  const isStaff = !!user && (user.role === 'supervisor' || user.role === 'admin');
  return <Ctx.Provider value={{ user, lang, setLang, t, pick, hasSo, login, logout, date, isStaff }}>{children}</Ctx.Provider>;
}
