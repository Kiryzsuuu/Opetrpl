const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');
const { isAuthenticated } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// List notifikasi
router.get('/', notifikasiController.index);

// Export CSV
router.get('/export/csv', notifikasiController.exportCsv);

// Mark as read
router.post('/:id/read', notifikasiController.markAsRead);

// Mark all as read
router.post('/read-all', notifikasiController.markAllAsRead);

// Delete notifikasi
router.delete('/:id', notifikasiController.destroy);

module.exports = router;
