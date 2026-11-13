const mongoose = require('mongoose');
module.exports = mongoose.model('Journal', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  prompt: { type: String },
  content: { type: String, required: true },        // AES-256-GCM ciphertext (iv.tag.data)
}, { timestamps: true }));
