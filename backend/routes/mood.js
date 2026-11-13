const router = require('express').Router();
const Mood = require('../models/Mood');
const { auth, requirePremium } = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { mood, energy, emotions, date } = req.body;
  res.status(201).json(await Mood.create({ user: req.user._id, mood, energy, emotions, date }));
});

// Free: raw history for the "Mood over Time" line chart
router.get('/', async (req, res) => {
  res.json(await Mood.find({ user: req.user._id }).sort({ date: 1 }).limit(90));
});

// Premium: weekly averages
router.get('/analytics/weekly', requirePremium, async (req, res) => {
  const rows = await Mood.aggregate([
    { $match: { user: req.user._id } },
    { $group: {
        _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } },
        avgMood: { $avg: '$mood' }, avgEnergy: { $avg: '$energy' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);
  res.json(rows.map(r => ({ year: r._id.year, week: r._id.week,
    avgMood: +r.avgMood.toFixed(2), avgEnergy: +r.avgEnergy.toFixed(2), count: r.count })));
});

// Premium: most common emotions for the pie chart
router.get('/analytics/emotions', requirePremium, async (req, res) => {
  const rows = await Mood.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$emotions' },
    { $group: { _id: '$emotions', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 8 },
  ]);
  res.json(rows.map(r => ({ emotion: r._id, count: r.count })));
});

module.exports = router;
