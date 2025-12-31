const Formulasi = require('../models/Formulasi');
const Komoditas = require('../models/Komoditas');
const { toCsv } = require('../utils/csv');

class FormulasiController {
  // List semua formulasi
  async index(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti' 
        ? { peneliti: req.session.userId }
        : {};
      
      const formulasi = await Formulasi.find(query)
        .populate('peneliti', 'nama')
        .populate('komposisi.komoditas', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('formulasi/index', {
        title: 'Formulasi Pangan',
        formulasi,
        items: formulasi,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching formulasi:', error);
      req.flash('error', 'Gagal memuat data formulasi');
      res.redirect('/dashboard');
    }
  }

  // Form tambah formulasi
  async create(req, res) {
    try {
      const komoditas = await Komoditas.find({ status: 'Tersedia' });
      
      res.render('formulasi/create', {
        title: 'Buat Formulasi Baru',
        komoditas,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/formulasi');
    }
  }

  // Proses tambah formulasi
  async store(req, res) {
    try {
      const formulasiData = {
        ...req.body,
        peneliti: req.session.userId,
        komposisi: JSON.parse(req.body.komposisi || '[]')
      };
      
      await Formulasi.create(formulasiData);
      
      req.flash('success', 'Formulasi berhasil dibuat');
      res.redirect('/formulasi');
    } catch (error) {
      console.error('Error creating formulasi:', error);
      req.flash('error', 'Gagal membuat formulasi');
      res.redirect('/formulasi/new');
    }
  }

  // Detail formulasi
  async show(req, res) {
    try {
      const formulasi = await Formulasi.findById(req.params.id)
        .populate('peneliti', 'nama email')
        .populate('komposisi.komoditas');
      
      if (!formulasi) {
        req.flash('error', 'Formulasi tidak ditemukan');
        return res.redirect('/formulasi');
      }
      
      // Cek analisis gizi dan uji lab terkait
      const AnalisisGizi = require('../models/AnalisisGizi');
      const UjiLab = require('../models/UjiLab');
      
      const analisisGizi = await AnalisisGizi.find({ formulasi: formulasi._id })
        .populate('analis', 'nama')
        .sort({ createdAt: -1 });
      
      const ujiLab = await UjiLab.find({ formulasi: formulasi._id })
        .populate('penanggungJawab', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('formulasi/show', {
        title: 'Detail Formulasi',
        formulasi,
        analisisGizi,
        ujiLab,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching formulasi:', error);
      req.flash('error', 'Gagal memuat detail formulasi');
      res.redirect('/formulasi');
    }
  }

  // Form edit formulasi
  async edit(req, res) {
    try {
      const formulasi = await Formulasi.findById(req.params.id)
        .populate('komposisi.komoditas');
      
      if (!formulasi) {
        req.flash('error', 'Formulasi tidak ditemukan');
        return res.redirect('/formulasi');
      }
      
      const komoditas = await Komoditas.find({ status: 'Tersedia' });
      
      res.render('formulasi/edit', {
        title: 'Edit Formulasi',
        formulasi,
        komoditas,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching formulasi:', error);
      req.flash('error', 'Gagal memuat data formulasi');
      res.redirect('/formulasi');
    }
  }

  // Proses update formulasi
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        komposisi: JSON.parse(req.body.komposisi || '[]')
      };
      
      await Formulasi.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Formulasi berhasil diupdate');
      res.redirect(`/formulasi/${req.params.id}`);
    } catch (error) {
      console.error('Error updating formulasi:', error);
      req.flash('error', 'Gagal mengupdate formulasi');
      res.redirect(`/formulasi/${req.params.id}/edit`);
    }
  }

  // Hapus formulasi
  async destroy(req, res) {
    try {
      await Formulasi.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Formulasi berhasil dihapus');
      res.redirect('/formulasi');
    } catch (error) {
      console.error('Error deleting formulasi:', error);
      req.flash('error', 'Gagal menghapus formulasi');
      res.redirect('/formulasi');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti'
        ? { peneliti: req.session.userId }
        : {};

      const formulasi = await Formulasi.find(query)
        .populate('peneliti', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
        { key: 'kategoriProduk', label: 'Kategori Produk' },
        { key: 'status', label: 'Status' },
        { key: 'peneliti', label: 'Peneliti' },
        { key: 'createdAt', label: 'Dibuat' }
      ];

      const rows = formulasi.map((f) => ({
        kode: f.kode || '',
        nama: f.nama || '',
        kategoriProduk: f.kategoriProduk || '',
        status: f.status || '',
        peneliti: f.peneliti && f.peneliti.nama ? f.peneliti.nama : '',
        createdAt: f.createdAt ? new Date(f.createdAt).toLocaleString('id-ID') : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `formulasi_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting formulasi CSV:', error);
      req.flash('error', 'Gagal export CSV formulasi');
      return res.redirect('/formulasi');
    }
  }
}

module.exports = new FormulasiController();
