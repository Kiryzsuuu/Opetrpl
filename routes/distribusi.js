const express = require('express');
const router = express.Router();
const distribusiController = require('../controllers/distribusiController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List distribusi
router.get('/', distribusiController.index);

// Export CSV
router.get('/export/csv', distribusiController.exportCsv);

// Create distribusi (Admin & Petugas Lapangan)
router.get('/new', hasRole('Admin', 'Petugas Lapangan'), distribusiController.create);
router.post('/', hasRole('Admin', 'Petugas Lapangan'), distribusiController.store);

// Show distribusi
router.get('/:id', distribusiController.show);

// Edit distribusi (Admin & Petugas Lapangan)
router.get('/:id/edit', hasRole('Admin', 'Petugas Lapangan'), distribusiController.edit);
router.put('/:id', hasRole('Admin', 'Petugas Lapangan'), distribusiController.update);

// Delete distribusi (Admin only)
router.delete('/:id', hasRole('Admin', 'Super Admin'), distribusiController.destroy);

module.exports = router;
