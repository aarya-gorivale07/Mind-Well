import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import ThemeButton from '../ThemeButton.jsx';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (mode === 'login' ? login(email, password) : register(email, password));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-top"><ThemeButton /></div>
      <form className="auth-form" onSubmit={submit}>
        <h1>MindWell</h1>
        <p className="lede">A quiet place to write, check in with your mood, and breathe. Your entries are encrypted before they are saved.</p>

        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>

        {mode === 'register' && (
          <p className="note">Your password also locks your journal. If you forget it, your entries cannot be recovered.</p>
        )}
        {error && <p className="error" role="alert">{error}</p>}

        <button className="primary" disabled={busy}>
          {busy ? 'Please wait' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}
