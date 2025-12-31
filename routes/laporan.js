const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { isAuthenticated } = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(isAuthenticated);

// Halaman laporan
router.get('/', laporanController.index);

// Export Excel
router.get('/export/excel', laporanController.exportExcel);

// Generate laporan
router.post('/generate', laporanController.generate);

module.exports = router;
