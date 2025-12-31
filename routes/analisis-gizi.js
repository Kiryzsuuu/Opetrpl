const express = require('express');
const router = express.Router();
const analisisGiziController = require('../controllers/analisisGiziController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List analisis gizi
router.get('/', analisisGiziController.index);

// Export CSV
router.get('/export/csv', analisisGiziController.exportCsv);

// Create analisis gizi (Admin & Peneliti)
router.get('/new', hasRole('Admin', 'Peneliti'), analisisGiziController.create);
router.post('/', hasRole('Admin', 'Peneliti'), analisisGiziController.store);

// Show analisis gizi
router.get('/:id', analisisGiziController.show);

// Edit analisis gizi (Admin & Peneliti)
router.get('/:id/edit', hasRole('Admin', 'Peneliti'), analisisGiziController.edit);
router.put('/:id', hasRole('Admin', 'Peneliti'), analisisGiziController.update);

// Delete analisis gizi (Admin only)
router.delete('/:id', hasRole('Admin', 'Super Admin'), analisisGiziController.destroy);

module.exports = router;
