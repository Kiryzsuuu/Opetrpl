const express = require('express');
const router = express.Router();
const produksiController = require('../controllers/produksiController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List produksi
router.get('/', produksiController.index);

// Export CSV
router.get('/export/csv', produksiController.exportCsv);

// Create produksi (Admin only)
router.get('/new', hasRole('Admin', 'Super Admin'), produksiController.create);
router.post('/', hasRole('Admin', 'Super Admin'), produksiController.store);

// Show produksi
router.get('/:id', produksiController.show);

// Edit produksi (Admin only)
router.get('/:id/edit', hasRole('Admin', 'Super Admin'), produksiController.edit);
router.put('/:id', hasRole('Admin', 'Super Admin'), produksiController.update);

// Delete produksi (Admin only)
router.delete('/:id', hasRole('Admin', 'Super Admin'), produksiController.destroy);

module.exports = router;
