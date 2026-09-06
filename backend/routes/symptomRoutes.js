const express = require('express');
const router = express.Router();
const {
  listSymptoms,
  createSymptom,
  deleteSymptom,
  getFollowupQuestions,
} = require('../controllers/symptomController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', listSymptoms);
router.post('/followup-questions', getFollowupQuestions);

// admin-only management
router.post('/', authenticate, requireAdmin, createSymptom);
router.delete('/:id', authenticate, requireAdmin, deleteSymptom);

module.exports = router;
