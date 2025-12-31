const express = require('express');
const router = express.Router();
const ujiLabController = require('../controllers/ujiLabController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List uji lab
router.get('/', ujiLabController.index);

// Export CSV
router.get('/export/csv', ujiLabController.exportCsv);

// Create uji lab (Admin & Peneliti)
router.get('/new', hasRole('Admin', 'Peneliti'), ujiLabController.create);
router.post('/', hasRole('Admin', 'Peneliti'), ujiLabController.store);

// Show uji lab
router.get('/:id', ujiLabController.show);

// Edit uji lab (Admin & Peneliti)
router.get('/:id/edit', hasRole('Admin', 'Peneliti'), ujiLabController.edit);
router.put('/:id', hasRole('Admin', 'Peneliti'), ujiLabController.update);

// Delete uji lab (Admin only)
router.delete('/:id', hasRole('Admin'), ujiLabController.destroy);

module.exports = router;
