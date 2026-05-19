const express = require('express');
const router = Router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * Public Routes
 */
router.get('/:username', scheduleController.getPublicSchedules);

/**
 * Private / Protected Routes
 */
router.get('/', verifyToken, scheduleController.getPrivateSchedules);
router.post('/', verifyToken, scheduleController.createSchedule);
router.put('/:id', verifyToken, scheduleController.editSchedule);
router.delete('/:id', verifyToken, scheduleController.deleteSchedule);

module.exports = router;
