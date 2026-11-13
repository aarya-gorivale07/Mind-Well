const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { deriveKey, decrypt } = require('../crypto');

// Verifies JWT and loads user
exports.auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
};

// Derives the encryption key from the x-journal-key header and verifies it
exports.withKey = (req, res, next) => {
  const pass = req.headers['x-journal-key'];
  if (!pass) return res.status(400).json({ error: 'Missing x-journal-key header' });
  try {
    const key = deriveKey(pass, req.user.salt);
    if (decrypt(req.user.keyCheck, key) !== 'mindwell') throw new Error();
    req.key = key;
    next();
  } catch { res.status(403).json({ error: 'Wrong passphrase' }); }
};

exports.requirePremium = (req, res, next) =>
  req.user.isPremium ? next() : res.status(402).json({ error: 'Premium feature' });
