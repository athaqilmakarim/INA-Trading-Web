const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./ina-trading-firebase-adminsdk-8ar08-173ce01ed5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ina-trading.firebaseio.com'
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to INA Trading Admin Panel');
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});