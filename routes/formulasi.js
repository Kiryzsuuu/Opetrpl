const express = require('express');
const router = express.Router();
const formulasiController = require('../controllers/formulasiController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List formulasi
router.get('/', formulasiController.index);

// Export CSV
router.get('/export/csv', formulasiController.exportCsv);

// Create formulasi (Admin & Peneliti)
router.get('/new', hasRole('Admin', 'Peneliti'), formulasiController.create);
router.post('/', hasRole('Admin', 'Peneliti'), formulasiController.store);

// Show formulasi
router.get('/:id', formulasiController.show);

// Edit formulasi (Admin & Peneliti)
router.get('/:id/edit', hasRole('Admin', 'Peneliti'), formulasiController.edit);
router.put('/:id', hasRole('Admin', 'Peneliti'), formulasiController.update);

// Delete formulasi (Admin only)
router.delete('/:id', hasRole('Admin'), formulasiController.destroy);

module.exports = router;
