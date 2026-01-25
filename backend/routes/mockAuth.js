const express = require('express');
const router = express.Router();

// Mock Seller Registration
router.post('/v1.0/seller/register', (req, res) => {
    console.log('Mock Seller Registration:', req.body);
    res.status(200).json({
        responseCode: "0000",
        responseDesc: "Success",
        message: "Registration successful"
    });
});

// Mock Buyer Registration
router.post('/v1.0/buyer/register', (req, res) => {
    console.log('Mock Buyer Registration:', req.body);
    res.status(200).json({
        responseCode: "0000",
        responseDesc: "Success",
        message: "Registration successful"
    });
});

module.exports = router;
