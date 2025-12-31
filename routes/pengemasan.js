const express = require('express');
const router = express.Router();
const pengemasanController = require('../controllers/pengemasanController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List pengemasan
router.get('/', pengemasanController.index);

// Export CSV
router.get('/export/csv', pengemasanController.exportCsv);

// Create pengemasan (Admin only)
router.get('/new', hasRole('Admin'), pengemasanController.create);
router.post('/', hasRole('Admin'), pengemasanController.store);

// Show pengemasan
router.get('/:id', pengemasanController.show);

// Edit pengemasan (Admin only)
router.get('/:id/edit', hasRole('Admin'), pengemasanController.edit);
router.put('/:id', hasRole('Admin'), pengemasanController.update);

// Delete pengemasan (Admin only)
router.delete('/:id', hasRole('Admin'), pengemasanController.destroy);

module.exports = router;
