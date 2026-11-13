import { createContext, useContext, useState, useCallback } from 'react';
import { api } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// The password is also the encryption passphrase. It lives only in
// sessionStorage (cleared when the tab closes) and is sent as x-journal-key.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('mw_token'));
  const [email, setEmail] = useState(() => sessionStorage.getItem('mw_email') || '');
  const [premium, setPremium] = useState(() => sessionStorage.getItem('mw_premium') === '1');

  const start = (data, em, pass) => {
    sessionStorage.setItem('mw_token', data.token);
    sessionStorage.setItem('mw_pass', pass);
    sessionStorage.setItem('mw_email', em);
    sessionStorage.setItem('mw_premium', data.isPremium ? '1' : '0');
    setToken(data.token);
    setEmail(em);
    setPremium(!!data.isPremium);
  };

  const login = async (em, pass) =>
    start(await api('/auth/login', { method: 'POST', body: { email: em, password: pass } }), em, pass);
  const register = async (em, pass) =>
    start(await api('/auth/register', { method: 'POST', body: { email: em, password: pass } }), em, pass);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setToken(null);
    setEmail('');
    setPremium(false);
  }, []);

  const upgrade = async () => {
    await api('/auth/upgrade', { method: 'POST' });
    sessionStorage.setItem('mw_premium', '1');
    setPremium(true);
  };

  return (
    <AuthCtx.Provider value={{ token, email, premium, login, register, logout, upgrade }}>
      {children}
    </AuthCtx.Provider>
  );
}
