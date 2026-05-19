const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public Route
router.get('/packages/:streamerId', gameController.getPackages);

// Protected Routes
router.post('/packages', verifyToken, gameController.createPackage);
router.put('/packages/:id', verifyToken, gameController.updatePackage);
router.delete('/packages/:id', verifyToken, gameController.deletePackage);

module.exports = router;
