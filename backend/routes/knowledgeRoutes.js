const express = require('express');
const router = express.Router();
const { getDiseases, getMedicines } = require('../controllers/knowledgeController');

router.get('/diseases', getDiseases);
router.get('/medicines', getMedicines);

module.exports = router;