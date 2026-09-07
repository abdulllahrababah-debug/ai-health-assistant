require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const historyRoutes = require('./routes/historyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));

// Rate limiters for security
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

const assessmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { message: 'عدد كبير من طلبات الفحص الطبي. يرجى الانتظار قليلاً.' },
});
app.use('/api/diagnosis/assess', assessmentLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Health Assistant API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/admin', adminRoutes);

// Serve React Frontend in unified single-host deployment
const path = require('path');
const fs = require('fs');
const frontendBuildPath = path.join(__dirname, '../frontend/build');

if (fs.existsSync(frontendBuildPath)) {
  console.log('Serving frontend static files from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const autoMigrate = require('./database/autoMigrate');

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`AI Health Assistant API listening on port ${PORT}`);
  try {
    await autoMigrate();
  } catch (err) {
    console.error('AutoMigrate error on startup:', err.message);
  }
});