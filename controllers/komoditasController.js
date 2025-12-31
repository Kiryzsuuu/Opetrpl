const Komoditas = require('../models/Komoditas');

class KomoditasController {
  // List semua komoditas
  async index(req, res) {
    try {
      const komoditas = await Komoditas.find()
        .populate('createdBy', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('komoditas/index', {
        title: 'Kelola Komoditas',
        komoditas,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching komoditas:', error);
      req.flash('error', 'Gagal memuat data komoditas');
      res.redirect('/dashboard');
    }
  }

  // Form tambah komoditas
  async create(req, res) {
    res.render('komoditas/create', {
      title: 'Tambah Komoditas',
      user: req.session.user,
      error: req.flash('error')
    });
  }

  // Proses tambah komoditas
  async store(req, res) {
    try {
      const komoditasData = {
        ...req.body,
        createdBy: req.session.userId
      };
      
      await Komoditas.create(komoditasData);
      
      req.flash('success', 'Komoditas berhasil ditambahkan');
      res.redirect('/komoditas');
    } catch (error) {
      console.error('Error creating komoditas:', error);
      req.flash('error', 'Gagal menambahkan komoditas');
      res.redirect('/komoditas/new');
    }
  }

  // Detail komoditas
  async show(req, res) {
    try {
      const komoditas = await Komoditas.findById(req.params.id)
        .populate('createdBy', 'nama');
      
      if (!komoditas) {
        req.flash('error', 'Komoditas tidak ditemukan');
        return res.redirect('/komoditas');
      }
      
      res.render('komoditas/show', {
        title: 'Detail Komoditas',
        komoditas,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching komoditas:', error);
      req.flash('error', 'Gagal memuat detail komoditas');
      res.redirect('/komoditas');
    }
  }

  // Form edit komoditas
  async edit(req, res) {
    try {
      const komoditas = await Komoditas.findById(req.params.id);
      
      if (!komoditas) {
        req.flash('error', 'Komoditas tidak ditemukan');
        return res.redirect('/komoditas');
      }
      
      res.render('komoditas/edit', {
        title: 'Edit Komoditas',
        komoditas,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching komoditas:', error);
      req.flash('error', 'Gagal memuat data komoditas');
      res.redirect('/komoditas');
    }
  }

  // Proses update komoditas
  async update(req, res) {
    try {
      await Komoditas.findByIdAndUpdate(req.params.id, req.body);
      
      req.flash('success', 'Komoditas berhasil diupdate');
      res.redirect('/komoditas');
    } catch (error) {
      console.error('Error updating komoditas:', error);
      req.flash('error', 'Gagal mengupdate komoditas');
      res.redirect(`/komoditas/${req.params.id}/edit`);
    }
  }

  // Hapus komoditas
  async destroy(req, res) {
    try {
      await Komoditas.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Komoditas berhasil dihapus');
      res.redirect('/komoditas');
    } catch (error) {
      console.error('Error deleting komoditas:', error);
      req.flash('error', 'Gagal menghapus komoditas');
      res.redirect('/komoditas');
    }
  }
}

module.exports = new KomoditasController();
