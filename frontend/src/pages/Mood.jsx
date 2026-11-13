import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useTheme } from '../theme.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const EMOTIONS = ['Calm', 'Happy', 'Grateful', 'Hopeful', 'Tired', 'Anxious', 'Stressed', 'Sad', 'Angry', 'Lonely'];
const word = (n) => (n <= 2 ? 'Very low' : n <= 4 ? 'Low' : n <= 6 ? 'Okay' : n <= 8 ? 'Good' : 'Great');

function colors(theme) {
  return theme === 'dark'
    ? { text: '#8FA1AA', grid: '#243039', mood: '#7BBDB6', energy: '#A9A2DD',
        pie: ['#7BBDB6', '#A9A2DD', '#E0B88A', '#8BB4E0', '#D99AA8', '#9CC98F', '#C7C7C7', '#7C8FA0'] }
    : { text: '#5B6C75', grid: '#D5DEE1', mood: '#3B7570', energy: '#7C73B8',
        pie: ['#3B7570', '#7C73B8', '#C9944F', '#5B8FC4', '#C2788A', '#6FA661', '#9AA5AB', '#4C6173'] };
}

function Locked({ children }) {
  const { upgrade } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <div className="locked">
      <p>{children}</p>
      <button className="primary" disabled={busy} onClick={async () => { setBusy(true); await upgrade(); }}>
        Unlock premium (demo)
      </button>
      <p className="muted">Payments are simulated for this project. <Link to="/account">Learn more</Link></p>
    </div>
  );
}

export default function Mood() {
  const { premium } = useAuth();
  const { theme } = useTheme();
  const c = colors(theme);
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(5);
  const [picked, setPicked] = useState([]);
  const [moods, setMoods] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setMoods(await api('/mood'));
    if (premium) {
      const [w, e] = await Promise.all([api('/mood/analytics/weekly'), api('/mood/analytics/emotions')]);
      setWeekly(w);
      setEmotions(e);
    }
  };
  useEffect(() => { load().catch((e) => setError(e.message)); }, [premium]);

  const toggle = (em) => setPicked((p) => (p.includes(em) ? p.filter((x) => x !== em) : [...p, em]));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/mood', { method: 'POST', body: { mood, energy, emotions: picked } });
      setPicked([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch (err) { setError(err.message); }
  };

  const axis = {
    ticks: { color: c.text }, grid: { color: c.grid },
  };
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: c.text } } },
    scales: { x: axis, y: { ...axis, min: 0, max: 10, ticks: { color: c.text, stepSize: 2 } } },
  };
  const day = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  return (
    <div className="page">
      <h1>How are you feeling?</h1>
      <form onSubmit={save} className="mood-form">
        <label className="slider">
          <span>Mood <strong>{mood}/10</strong> <em>{word(mood)}</em></span>
          <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(+e.target.value)} />
        </label>
        <label className="slider">
          <span>Energy <strong>{energy}/10</strong> <em>{word(energy)}</em></span>
          <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(+e.target.value)} />
        </label>
        <fieldset>
          <legend>What fits right now?</legend>
          <div className="chips">
            {EMOTIONS.map((em) => (
              <button type="button" key={em} className={picked.includes(em) ? 'chip on' : 'chip'}
                aria-pressed={picked.includes(em)} onClick={() => toggle(em)}>{em}</button>
            ))}
          </div>
        </fieldset>
        <div className="row">
          <span className="muted" role="status">{saved ? 'Check-in saved' : ''}</span>
          <button className="primary">Save check-in</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <h2>Mood over time</h2>
      {moods.length < 2 ? <p className="muted">Log at least two check-ins to see your trend.</p> :
        <div className="chart"><Line options={baseOpts} data={{
          labels: moods.map((m) => day(m.date)),
          datasets: [
            { label: 'Mood', data: moods.map((m) => m.mood), borderColor: c.mood, backgroundColor: c.mood, tension: 0.35 },
            { label: 'Energy', data: moods.map((m) => m.energy), borderColor: c.energy, backgroundColor: c.energy, tension: 0.35 },
          ] }} /></div>}

      <h2>Weekly averages</h2>
      {!premium ? <Locked>Weekly averages show how your mood and energy shift from week to week.</Locked> :
        weekly.length === 0 ? <p className="muted">Nothing to average yet.</p> :
        <div className="chart"><Bar options={baseOpts} data={{
          labels: weekly.map((w) => `Wk ${w.week}`),
          datasets: [
            { label: 'Avg mood', data: weekly.map((w) => w.avgMood), backgroundColor: c.mood },
            { label: 'Avg energy', data: weekly.map((w) => w.avgEnergy), backgroundColor: c.energy },
          ] }} /></div>}

      <h2>Most common emotions</h2>
      {!premium ? <Locked>See which emotions show up most often in your check-ins.</Locked> :
        emotions.length === 0 ? <p className="muted">Pick emotions in your check-ins to see this chart.</p> :
        <div className="chart small"><Pie options={{ responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: c.text } } } }}
          data={{ labels: emotions.map((e) => e.emotion),
            datasets: [{ data: emotions.map((e) => e.count), backgroundColor: c.pie, borderWidth: 0 }] }} /></div>}
    </div>
  );
}
