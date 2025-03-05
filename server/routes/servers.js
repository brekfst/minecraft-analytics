const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { validateServer, validateClaim } = require('../middleware/validation');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', serverController.getAllServers);
router.get('/featured', serverController.getFeaturedServers);
router.get('/top', serverController.getTopServers);
router.get('/rising', serverController.getRisingServers);
router.get('/stats', serverController.getGlobalStats);
router.get('/:id', serverController.getServerById);

// Routes that require authentication or have special handling
router.post('/', validateServer, serverController.createServer);
router.post('/:id/claim', validateClaim, serverController.claimServer);

module.exports = router;