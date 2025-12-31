const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function generateUniqueUsernameFromEmail(email) {
  const localPart = normalizeEmail(email).split('@')[0] || 'user';
  const base = localPart.replace(/[^a-z0-9._-]/gi, '').slice(0, 20) || 'user';
  let candidate = base;
  let attempt = 0;

  while (await User.exists({ username: candidate })) {
    attempt += 1;
    candidate = `${base}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    if (attempt >= 10) {
      candidate = `${base}${Date.now()}`.slice(0, 30);
      break;
    }
  }

  return candidate;
}

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
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  // Proses tambah user
  async store(req, res) {
    try {
      const {
        username,
        email,
        password,
        confirmPassword,
        nama,
        noTelepon,
        role,
        status
      } = req.body;

      if (!password || !confirmPassword || password !== confirmPassword) {
        req.flash('error', 'Password dan Konfirmasi Password tidak sama');
        return res.redirect('/users/new');
      }

      const normalizedEmail = normalizeEmail(email);

      const finalUsername =
        (username && String(username).trim()) ||
        (await generateUniqueUsernameFromEmail(normalizedEmail));

      await User.create({
        username: finalUsername,
        email: normalizedEmail,
        password,
        nama,
        noTelepon,
        role,
        status: status || 'Aktif'
      });
      
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
        currentUser: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
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
        success: req.flash('success'),
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

      // Normalize email if present
      if (typeof updateData.email !== 'undefined') {
        updateData.email = normalizeEmail(updateData.email);
      }

      // Validate confirm password if provided
      if ((updateData.password && updateData.password.trim() !== '') || (updateData.confirmPassword && updateData.confirmPassword.trim() !== '')) {
        if ((updateData.password || '') !== (updateData.confirmPassword || '')) {
          req.flash('error', 'Password Baru dan Konfirmasi Password tidak sama');
          return res.redirect(`/users/${req.params.id}/edit`);
        }
      }

      // confirmPassword is not part of schema
      delete updateData.confirmPassword;
      
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

  // Set status user (Aktif / Tidak Aktif)
  async setStatus(req, res) {
    try {
      if (req.params.id === req.session.userId) {
        req.flash('error', 'Tidak dapat mengubah status akun sendiri');
        return res.redirect('/users');
      }

      const nextStatus = String(req.body.status || '').trim();
      if (!['Aktif', 'Tidak Aktif'].includes(nextStatus)) {
        req.flash('error', 'Status tidak valid');
        return res.redirect('/users');
      }

      const userData = await User.findById(req.params.id);
      if (!userData) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
      }

      userData.status = nextStatus;
      await userData.save();

      req.flash('success', `Status user berhasil diubah menjadi ${userData.status}`);
      res.redirect('/users');
    } catch (error) {
      console.error('Error setting user status:', error);
      req.flash('error', 'Gagal mengubah status user');
      res.redirect('/users');
    }
  }

  // Set role user
  async setRole(req, res) {
    try {
      if (req.params.id === req.session.userId) {
        req.flash('error', 'Tidak dapat mengubah role akun sendiri');
        return res.redirect('/users');
      }

      const nextRole = String(req.body.role || '').trim();
      const allowedRoles = ['Super Admin', 'Admin', 'Peneliti', 'Petugas Lapangan'];
      if (!allowedRoles.includes(nextRole)) {
        req.flash('error', 'Role tidak valid');
        return res.redirect('/users');
      }

      const userData = await User.findById(req.params.id);
      if (!userData) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
      }

      userData.role = nextRole;
      await userData.save();

      req.flash('success', `Role user berhasil diubah menjadi ${userData.role}`);
      res.redirect('/users');
    } catch (error) {
      console.error('Error setting user role:', error);
      req.flash('error', 'Gagal mengubah role user');
      res.redirect('/users');
    }
  }
}

module.exports = new UserController();
