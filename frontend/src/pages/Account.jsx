import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { downloadExport } from '../api.js';

export default function Account() {
  const { email, premium, upgrade, logout } = useAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setMsg('');
    setBusy(true);
    try { await downloadExport(); setMsg('Export downloaded.'); }
    catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="page">
      <h1>Account</h1>
      <dl className="facts">
        <dt>Email</dt><dd>{email}</dd>
        <dt>Plan</dt><dd>{premium ? 'Premium' : 'Free'}</dd>
      </dl>

      <h2>Your data</h2>
      <p>Download every journal entry and mood check-in as a JSON file. Entries are decrypted with your passphrase so the file is readable.</p>
      <button className="primary" onClick={doExport} disabled={busy}>{busy ? 'Preparing' : 'Download my data'}</button>
      {msg && <p className="muted" role="status">{msg}</p>}

      {!premium && (<>
        <h2>Premium</h2>
        <p>Unlock weekly mood averages, the emotions chart, and your full journal history with search. Payments are simulated in this project, so this button upgrades you instantly.</p>
        <button className="primary" onClick={upgrade}>Unlock premium (demo)</button>
      </>)}

      <h2>Session</h2>
      <p>Logging out clears your passphrase from this browser tab.</p>
      <button className="ghost" onClick={logout}>Log out</button>
    </div>
  );
}
