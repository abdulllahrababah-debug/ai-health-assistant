const express = require('express');
const router = express.Router();
const { getHistory, getHistoryItem, deleteHistoryItem } = require('../controllers/historyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getHistory);
router.get('/:id', getHistoryItem);
router.delete('/:id', deleteHistoryItem);

module.exports = router;