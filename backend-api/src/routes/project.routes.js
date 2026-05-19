const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public Routes
router.get('/check-access', projectController.checkAccess);
router.get('/:streamerId', projectController.getProjects);

// Protected Routes
router.post('/', verifyToken, projectController.createProject);
router.put('/:id', verifyToken, projectController.updateProject);
router.delete('/:id', verifyToken, projectController.deleteProject);

module.exports = router;
