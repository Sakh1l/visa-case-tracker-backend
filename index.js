// Main entry for Express backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Routers
const casesRouter = require('./routes/cases');
const uploadRouter = require('./routes/upload');
const shareRouter = require('./routes/share');
const { protect } = require('./middleware/auth');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/cases', protect, casesRouter);
app.use('/api/upload', protect, uploadRouter);
app.use('/api/share', shareRouter);

app.get('/', (req, res) => {
  res.send('VisaCase Tracker backend running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
