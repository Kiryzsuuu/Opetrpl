const express = require('express');
const router = express.Router();
const komoditasController = require('../controllers/komoditasController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List komoditas
router.get('/', komoditasController.index);

// Create komoditas (Admin only)
router.get('/new', hasRole('Admin', 'Super Admin'), komoditasController.create);
router.post('/', hasRole('Admin', 'Super Admin'), komoditasController.store);

// Show komoditas
router.get('/:id', komoditasController.show);

// Edit komoditas (Admin only)
router.get('/:id/edit', hasRole('Admin', 'Super Admin'), komoditasController.edit);
router.put('/:id', hasRole('Admin', 'Super Admin'), komoditasController.update);

// Delete komoditas (Admin only)
router.delete('/:id', hasRole('Admin', 'Super Admin'), komoditasController.destroy);

module.exports = router;
