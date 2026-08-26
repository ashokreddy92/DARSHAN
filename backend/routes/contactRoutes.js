const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, sendContactEmail);

module.exports = router;

