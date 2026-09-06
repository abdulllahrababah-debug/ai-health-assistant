const express = require('express');
const router = express.Router();
const { runAssessment, getResult, getDynamicQuestions } = require('../controllers/diagnosisController');
const { optionalAuth } = require('../middleware/auth');

// Dynamic question generator based on symptoms and patient profile
router.post('/dynamic-questions', getDynamicQuestions);

// Assessment can be run anonymously (optionalAuth attaches user if logged in)
router.post('/assess', optionalAuth, runAssessment);
router.get('/result/:id', getResult);

module.exports = router;
