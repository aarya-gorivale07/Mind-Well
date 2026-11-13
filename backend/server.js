require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, allowedHeaders: ['Content-Type', 'Authorization', 'x-journal-key'] }));
app.use(express.json());

app.get('/', (_, res) => res.send('MindWell API running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/export', require('./routes/export'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API up')))
  .catch(err => { console.error(err); process.exit(1); });
