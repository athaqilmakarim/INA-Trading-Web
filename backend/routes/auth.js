const express = require('express');
const admin = require('firebase-admin');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateRequest } = require('../middleware/validateRequest');
const { createCustomTokenSchema } = require('../schemas/authSchema');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post(
  '/create-custom-token',
  validateRequest(createCustomTokenSchema),
  asyncHandler(async (req, res) => {
    const { email, uid, displayName } = req.body;

    logger.info({ email, uid }, 'Creating Firebase custom token');

    const additionalClaims = {
      email,
      emailVerified: true
    };

    if (displayName) {
      additionalClaims.displayName = displayName;
    }

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

    res.json({ customToken });
  })
);

module.exports = router;
