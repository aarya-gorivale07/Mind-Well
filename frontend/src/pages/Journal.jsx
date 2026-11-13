import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Link } from 'react-router-dom';

const FREE_LIMIT = 10;

export default function Journal() {
  const { premium } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/journal/prompt').then((d) => setPrompt(d.prompt)).catch(() => {});
    api('/journal', { key: true })
      .then(setEntries)
      .catch((e) => setError(e.status === 403
        ? 'Your passphrase did not unlock these entries. Log out and sign in again.'
        : e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const entry = await api('/journal', { method: 'POST', key: true, body: { content: text, prompt } });
      setEntries((prev) => [entry, ...prev]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    await api(`/journal/${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((x) => x.id !== id));
  };

  const visible = useMemo(() => {
    if (!premium) return entries.slice(0, FREE_LIMIT);
    const term = q.trim().toLowerCase();
    return term ? entries.filter((x) => `${x.prompt || ''} ${x.content}`.toLowerCase().includes(term)) : entries;
  }, [entries, q, premium]);

  return (
    <div className="page">
      <h1>Today</h1>
      <form onSubmit={save} className="writer">
        {prompt && <p className="prompt">{prompt}</p>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
          placeholder="Start writing. Only you can read this." aria-label="Journal entry" />
        <div className="row">
          <span className="muted">Encrypted before it is stored</span>
          <button className="primary" disabled={saving || !text.trim()}>{saving ? 'Saving' : 'Save entry'}</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="list-head">
        <h2>Past entries</h2>
        {premium ? (
          <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search all entries" aria-label="Search entries" />
        ) : entries.length > FREE_LIMIT ? (
          <p className="muted">Showing your latest {FREE_LIMIT}. <Link to="/account">Go premium</Link> for full history and search.</p>
        ) : null}
      </section>

      {loading ? <p className="muted">Unlocking your journal</p> :
        visible.length === 0 ? <p className="muted">{q ? 'No entries match that search.' : 'No entries yet. Answer today\'s prompt to begin.'}</p> :
        <ul className="entries">
          {visible.map((x) => (
            <li key={x.id}>
              <time dateTime={x.createdAt}>
                {new Date(x.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
              <div>
                {x.prompt && <p className="entry-prompt">{x.prompt}</p>}
                <p className="entry-body">{x.content}</p>
                <button className="link danger" onClick={() => remove(x.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>}
    </div>
  );
}
