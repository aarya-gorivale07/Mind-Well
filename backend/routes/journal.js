const router = require('express').Router();
const Journal = require('../models/Journal');
const { auth, withKey } = require('../middleware/auth');
const { encrypt, decrypt } = require('../crypto');

const PROMPTS = [
  'What made you smile today?', 'What are three things you are grateful for?',
  'What is weighing on your mind right now?', 'Describe a moment you felt calm today.',
  'Who made a positive difference in your day?', 'What is one thing you did well today?',
  'What do you need more of in your life?', 'What would you tell your younger self?',
  'What are you looking forward to?', 'How did you take care of yourself today?',
];

router.get('/prompt', (req, res) => {
  const day = Math.floor(Date.now() / 86400000);
  res.json({ prompt: PROMPTS[day % PROMPTS.length] });
});

router.use(auth);

router.post('/', withKey, async (req, res) => {
  const { content, prompt } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const entry = await Journal.create({ user: req.user._id, prompt, content: encrypt(content, req.key) });
  res.status(201).json({ id: entry._id, prompt, content, createdAt: entry.createdAt });
});

router.get('/', withKey, async (req, res) => {
  const entries = await Journal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(entries.map(e => ({
    id: e._id, prompt: e.prompt, content: decrypt(e.content, req.key), createdAt: e.createdAt,
  })));
});

router.put('/:id', withKey, async (req, res) => {
  const e = await Journal.findOne({ _id: req.params.id, user: req.user._id });
  if (!e) return res.status(404).json({ error: 'Not found' });
  e.content = encrypt(req.body.content, req.key);
  await e.save();
  res.json({ id: e._id, content: req.body.content, updatedAt: e.updatedAt });
});

router.delete('/:id', async (req, res) => {
  await Journal.deleteOne({ _id: req.params.id, user: req.user._id });
  res.status(204).end();
});

module.exports = router;
