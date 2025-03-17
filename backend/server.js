const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./ina-trading-firebase-adminsdk-8ar08-173ce01ed5.json');
const authRoutes = require('./routes/auth');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ina-trading.firebaseio.com'
});

const db = admin.firestore();
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://admin.inatrading.co.id', 'https://www.admin.inatrading.co.id'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to INA Trading Admin Panel');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});