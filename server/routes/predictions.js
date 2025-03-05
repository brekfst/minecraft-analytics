const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { validatePrediction } = require('../middleware/validation');
const { authenticateApiKey } = require('../middleware/auth');

// Public routes
router.get('/:serverId/latest/:type', predictionController.getLatestPredictions);
router.get('/:serverId/range/:type', predictionController.getPredictionsInRange);
router.get('/:serverId/next24hours', predictionController.getNext24HoursPredictions);
router.get('/:serverId/peak', predictionController.getPredictedPeak);
router.get('/:serverId/downtime', predictionController.getPredictedDowntime);
router.get('/:serverId/insights', predictionController.getTopInsights);

// Protected routes (requires API key)
router.post('/', authenticateApiKey, validatePrediction, predictionController.createPrediction);

module.exports = router;