const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, saveMedicalHistory } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/medical-history', saveMedicalHistory);

module.exports = router;