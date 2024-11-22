const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

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

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});