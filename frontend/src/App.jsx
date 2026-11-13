import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import ThemeButton from './ThemeButton.jsx';
import Auth from './pages/Auth.jsx';
import Journal from './pages/Journal.jsx';
import Mood from './pages/Mood.jsx';
import Breathe from './pages/Breathe.jsx';
import Account from './pages/Account.jsx';

function Shell({ children }) {
  return (
    <div className="app">
      <nav className="rail" aria-label="Main">
        <div className="brand">MindWell</div>
        <NavLink to="/">Journal</NavLink>
        <NavLink to="/mood">Mood</NavLink>
        <NavLink to="/breathe">Breathe</NavLink>
        <NavLink to="/account">Account</NavLink>
        <div className="rail-foot"><ThemeButton /></div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

function Private({ children }) {
  const { token } = useAuth();
  return token ? <Shell>{children}</Shell> : <Navigate to="/login" replace />;
}

export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={<Private><Journal /></Private>} />
      <Route path="/mood" element={<Private><Mood /></Private>} />
      <Route path="/breathe" element={<Private><Breathe /></Private>} />
      <Route path="/account" element={<Private><Account /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
