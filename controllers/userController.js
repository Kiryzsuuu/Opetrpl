const User = require('../models/User');

class UserController {
  // List semua user (Super Admin only)
  async index(req, res) {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.render('users/index', {
        title: 'Management User',
        users,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      req.flash('error', 'Gagal memuat data user');
      res.redirect('/dashboard');
    }
  }

  // Form tambah user
  async create(req, res) {
    res.render('users/create', {
      title: 'Tambah User',
      user: req.session.user,
      error: req.flash('error')
    });
  }

  // Proses tambah user
  async store(req, res) {
    try {
      await User.create(req.body);
      
      req.flash('success', 'User berhasil ditambahkan');
      res.redirect('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      req.flash('error', error.code === 11000 ? 'Username atau email sudah digunakan' : 'Gagal menambahkan user');
      res.redirect('/users/new');
    }
  }

  // Detail user
  async show(req, res) {
    try {
      const userData = await User.findById(req.params.id).select('-password');
      
      if (!userData) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
      }
      
      res.render('users/show', {
        title: 'Detail User',
        user: userData,
        currentUser: req.session.user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      req.flash('error', 'Gagal memuat detail user');
      res.redirect('/users');
    }
  }

  // Form edit user
  async edit(req, res) {
    try {
      const userData = await User.findById(req.params.id).select('-password');
      
      if (!userData) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
      }
      
      res.render('users/edit', {
        title: 'Edit User',
        userData,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      req.flash('error', 'Gagal memuat data user');
      res.redirect('/users');
    }
  }

  // Proses update user
  async update(req, res) {
    try {
      const updateData = { ...req.body };
      
      // Jika password kosong, jangan update password
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }
      
      await User.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'User berhasil diupdate');
      res.redirect('/users');
    } catch (error) {
      console.error('Error updating user:', error);
      req.flash('error', 'Gagal mengupdate user');
      res.redirect(`/users/${req.params.id}/edit`);
    }
  }

  // Hapus user
  async destroy(req, res) {
    try {
      // Cegah menghapus diri sendiri
      if (req.params.id === req.session.userId) {
        req.flash('error', 'Tidak dapat menghapus akun sendiri');
        return res.redirect('/users');
      }
      
      await User.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'User berhasil dihapus');
      res.redirect('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      req.flash('error', 'Gagal menghapus user');
      res.redirect('/users');
    }
  }

  // Toggle status user
  async toggleStatus(req, res) {
    try {
      const userData = await User.findById(req.params.id);
      
      if (!userData) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
      }
      
      userData.status = userData.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
      await userData.save();
      
      req.flash('success', `Status user berhasil diubah menjadi ${userData.status}`);
      res.redirect('/users');
    } catch (error) {
      console.error('Error toggling user status:', error);
      req.flash('error', 'Gagal mengubah status user');
      res.redirect('/users');
    }
  }
}

module.exports = new UserController();
