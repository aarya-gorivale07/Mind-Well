const mongoose = require('mongoose');
module.exports = mongoose.model('Mood', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mood: { type: Number, min: 1, max: 10, required: true },
  energy: { type: Number, min: 1, max: 10, required: true },
  emotions: [String],
  date: { type: Date, default: Date.now },
}));
