const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const { validateMeasurement } = require('../middleware/validation');
const { authenticateApiKey } = require('../middleware/auth');

// Public routes
router.get('/:serverId/latest', measurementController.getLatestMeasurement);
router.get('/:serverId/history', measurementController.getServerHistory);
router.get('/:serverId/player-history', measurementController.getPlayerHistory);
router.get('/:serverId/uptime', measurementController.getUptimePercentage);
router.get('/:serverId/peak-hour', measurementController.getPeakHour);
router.get('/global/player-count', measurementController.getTotalPlayerCount);

// Protected routes (requires API key)
router.post('/', authenticateApiKey, validateMeasurement, measurementController.createMeasurement);

module.exports = router;