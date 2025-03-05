const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateFeaturedServer } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(authenticateAdmin);

// Server management routes
router.get('/servers/pending', adminController.getPendingServers);
router.post('/servers/:id/approve', adminController.approveServer);
router.post('/servers/:id/reject', adminController.rejectServer);

// Claims management routes
router.get('/claims/pending', adminController.getPendingClaims);
router.post('/claims/:id/approve', adminController.approveClaim);
router.post('/claims/:id/reject', adminController.rejectClaim);

// Featured servers management routes
router.get('/featured', adminController.getFeaturedServers);
router.post('/featured', validateFeaturedServer, adminController.addFeaturedServer);
router.put('/featured/:id', adminController.updateFeaturedServer);
router.delete('/featured/:id', adminController.removeFeaturedServer);

// Admin dashboard statistics
router.get('/stats', adminController.getAdminStats);

module.exports = router;