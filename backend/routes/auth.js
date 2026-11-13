const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { newSalt, deriveKey, encrypt } = require('../crypto');

const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// The password doubles as the encryption passphrase. The client keeps it in
// memory/sessionStorage and sends it as x-journal-key on journal requests.
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8)
    return res.status(400).json({ error: 'Email and 8+ char password required' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email in use' });
  const salt = newSalt();
  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    salt,
    keyCheck: encrypt('mindwell', deriveKey(password, salt)),
  });
  res.status(201).json({ token: sign(user), isPremium: user.isPremium });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), isPremium: user.isPremium });
});

// Demo "upgrade" (stands in for real payments)
router.post('/upgrade', auth, async (req, res) => {
  req.user.isPremium = true;
  await req.user.save();
  res.json({ isPremium: true });
});

module.exports = router;
