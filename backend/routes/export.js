const router = require('express').Router();
const Journal = require('../models/Journal');
const Mood = require('../models/Mood');
const { auth, withKey } = require('../middleware/auth');
const { decrypt } = require('../crypto');

router.get('/', auth, withKey, async (req, res) => {
  const [entries, moods] = await Promise.all([
    Journal.find({ user: req.user._id }).sort({ createdAt: 1 }),
    Mood.find({ user: req.user._id }).sort({ date: 1 }),
  ]);
  res.setHeader('Content-Disposition', 'attachment; filename="mindwell-export.json"');
  res.json({
    exportedAt: new Date().toISOString(),
    account: { email: req.user.email, isPremium: req.user.isPremium },
    journalEntries: entries.map(e => ({
      prompt: e.prompt, content: decrypt(e.content, req.key), createdAt: e.createdAt })),
    moodLogs: moods,
  });
});

module.exports = router;
