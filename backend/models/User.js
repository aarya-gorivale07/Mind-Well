const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },   // bcrypt (login only)
  salt: { type: String, required: true },           // for key derivation, not secret
  keyCheck: { type: String, required: true },       // encrypted known string to verify passphrase
  isPremium: { type: Boolean, default: false },
}, { timestamps: true }));
