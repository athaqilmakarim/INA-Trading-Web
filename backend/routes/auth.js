const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Create custom token for INA PAS users
router.post('/create-custom-token', async (req, res) => {
  try {
    const { email, uid, displayName } = req.body;

    // Create custom token
    const customToken = await admin.auth().createCustomToken(uid, {
      email: email,
      displayName: displayName,
      emailVerified: true
    });

    res.json({ customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ error: 'Failed to create custom token' });
  }
});

module.exports = router; 