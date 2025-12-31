const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route hanya untuk Super Admin
router.use(isAuthenticated);
router.use(hasRole('Super Admin'));

// List users
router.get('/', userController.index);

// Create user
router.get('/new', userController.create);
router.post('/', userController.store);

// Show user
router.get('/:id', userController.show);

// Edit user
router.get('/:id/edit', userController.edit);
router.put('/:id', userController.update);

// Delete user
router.delete('/:id', userController.destroy);

// Toggle status
router.post('/:id/toggle-status', userController.toggleStatus);

module.exports = router;
