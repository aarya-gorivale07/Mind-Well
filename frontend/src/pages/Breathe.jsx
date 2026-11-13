import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s
const PHASES = [
  { name: 'Inhale', seconds: 4, scale: 1 },
  { name: 'Hold', seconds: 7, scale: 1 },
  { name: 'Exhale', seconds: 8, scale: 0.5 },
];

export default function Breathe() {
  const reduce = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (left > 1) return setLeft(left - 1);
      const next = (i + 1) % PHASES.length;
      if (next === 0) setCycles((c) => c + 1);
      setI(next);
      setLeft(PHASES[next].seconds);
    }, 1000);
    return () => clearTimeout(t);
  }, [running, i, left]);

  const start = () => { setI(0); setLeft(PHASES[0].seconds); setCycles(0); setRunning(true); };
  const stop = () => { setRunning(false); setI(0); setLeft(PHASES[0].seconds); };

  const phase = PHASES[i];
  const target = running ? phase.scale : 0.5;
  const duration = reduce ? 0 : running ? phase.seconds : 0.8;

  return (
    <div className="page breathe">
      <h1>Breathe</h1>
      <p className="lede">Follow the circle. Breathe in for 4, hold for 7, breathe out for 8.</p>

      <div className="stage" aria-live="polite">
        <div className="ring" aria-hidden="true" />
        <motion.div className="orb" aria-hidden="true"
          initial={{ scale: 0.5 }} animate={{ scale: target }}
          transition={{ duration, ease: 'easeInOut' }} />
        <div className="orb-label">
          {running ? (<><span className="phase">{phase.name}</span><span className="count">{left}</span></>)
            : <span className="phase">Ready</span>}
        </div>
      </div>

      <div className="row center">
        {running
          ? <button className="primary" onClick={stop}>Stop</button>
          : <button className="primary" onClick={start}>{cycles ? 'Start again' : 'Begin'}</button>}
      </div>
      {cycles > 0 && <p className="muted center">{cycles} full {cycles === 1 ? 'breath' : 'breaths'} completed</p>}
    </div>
  );
}
