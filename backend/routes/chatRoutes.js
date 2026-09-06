const express = require('express');
const router = express.Router();
const { sendMessage, analyzeImage } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);
router.post('/message', sendMessage);
router.post('/analyze-image', analyzeImage);

module.exports = router;