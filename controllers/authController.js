const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../config/mailer');

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

class AuthController {
  // Tampilkan halaman login
  async showLogin(req, res) {
    res.render('auth/login', {
      title: 'Login',
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  // Tampilkan halaman register
  async showRegister(req, res) {
    res.render('auth/register', {
      title: 'Register',
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  // Proses login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = normalizeEmail(email);

      const user = await User.findOne({ email: normalizedEmail, status: 'Aktif' });
      
      if (!user) {
        req.flash('error', 'Email atau password salah');
        return res.redirect('/login');
      }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      req.flash('error', 'Email atau password salah');
      return res.redirect('/login');
    }

    // Simpan user ke session
    req.session.userId = user._id;
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      nama: user.nama,
      namaLengkap: user.nama,
      nomorTelepon: user.noTelepon
    };

    req.flash('success', 'Login berhasil!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan saat login');
    res.redirect('/login');
  }
}

  // Proses register
  async register(req, res) {
    try {
      const { email, password, confirmPassword, nama, noTelepon } = req.body;
      const normalizedEmail = normalizeEmail(email);

      // Validasi password match
      if (password !== confirmPassword) {
        req.flash('error', 'Password dan Konfirmasi Password tidak sama');
        return res.redirect('/register');
      }

      // Cek apakah email sudah ada
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        req.flash('error', 'Email sudah terdaftar');
        return res.redirect('/register');
      }

      const username = await generateUniqueUsernameFromEmail(normalizedEmail);

      // Buat user baru dengan role default "Petugas Lapangan"
      const newUser = new User({
        username,
        email: normalizedEmail,
        password,
        nama,
        noTelepon,
        role: 'Petugas Lapangan',
        status: 'Tidak Aktif' // Perlu aktivasi admin
      });

      await newUser.save();

      req.flash('success', 'Registrasi berhasil! Silakan tunggu aktivasi dari admin.');
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan saat registrasi');
      res.redirect('/register');
    }
  }

  // Tampilkan halaman forgot password
  async showForgotPassword(req, res) {
    res.render('auth/forgot-password', {
      title: 'Lupa Password',
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  // Proses forgot password (kirim email)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const normalizedEmail = normalizeEmail(email);

      const user = await User.findOne({ email: normalizedEmail });

      // Jangan bocorkan apakah email terdaftar atau tidak
      const successMessage = 'Jika email terdaftar, link reset password akan dikirim.';

      if (!user) {
        req.flash('success', successMessage);
        return res.redirect('/forgot-password');
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
      await user.save();

      await sendPasswordResetEmail({
        to: user.email,
        token
      });

      req.flash('success', successMessage);
      res.redirect('/forgot-password');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Gagal mengirim email reset password. Coba lagi nanti.');
      res.redirect('/forgot-password');
    }
  }

  // Tampilkan halaman reset password
  async showResetPassword(req, res) {
    const { token } = req.params;
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token,
      success: req.flash('success'),
      error: req.flash('error')
    });
  }

  // Proses reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        req.flash('error', 'Password dan Konfirmasi Password tidak sama');
        return res.redirect(`/reset-password/${token}`);
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        req.flash('error', 'Link reset password tidak valid atau sudah kadaluarsa.');
        return res.redirect('/forgot-password');
      }

      user.password = password;
      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();

      req.flash('success', 'Password berhasil direset. Silakan login.');
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan saat reset password');
      res.redirect('/forgot-password');
    }
  }

  // Logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/login');
    });
  }

  // Dashboard berdasarkan role
  async dashboard(req, res) {
    try {
      const user = req.session.user;
      
      // Data statistik dashboard berdasarkan role
      const stats = {};
      
      if (user.role === 'Super Admin') {
        const User = require('../models/User');
        const Komoditas = require('../models/Komoditas');
        const Formulasi = require('../models/Formulasi');
        const Produksi = require('../models/Produksi');
        const Distribusi = require('../models/Distribusi');
        
        stats.totalUser = await User.countDocuments();
        stats.totalKomoditas = await Komoditas.countDocuments();
        stats.totalFormulasi = await Formulasi.countDocuments();
        stats.totalProduksi = await Produksi.countDocuments();
        stats.totalDistribusi = await Distribusi.countDocuments();
      } else if (user.role === 'Admin') {
        const User = require('../models/User');
        const Komoditas = require('../models/Komoditas');
        const Formulasi = require('../models/Formulasi');
        const Produksi = require('../models/Produksi');
        
        stats.totalUser = await User.countDocuments();
        stats.totalKomoditas = await Komoditas.countDocuments();
        stats.totalFormulasi = await Formulasi.countDocuments();
        stats.totalProduksi = await Produksi.countDocuments();
      } else if (user.role === 'Peneliti') {
        const Formulasi = require('../models/Formulasi');
        const AnalisisGizi = require('../models/AnalisisGizi');
        const UjiLab = require('../models/UjiLab');
        
        stats.totalFormulasi = await Formulasi.countDocuments({ peneliti: user._id });
        stats.totalAnalisis = await AnalisisGizi.countDocuments({ analis: user._id });
        stats.totalUjiLab = await UjiLab.countDocuments({ penanggungJawab: user._id });
      } else if (user.role === 'Petugas Lapangan') {
        const Distribusi = require('../models/Distribusi');
        
        stats.totalDistribusi = await Distribusi.countDocuments({ petugas: user._id });
        stats.dalamPerjalanan = await Distribusi.countDocuments({ 
          petugas: user._id, 
          status: 'Dalam Perjalanan' 
        });
      }

      res.render('dashboard', {
        title: 'Dashboard',
        user,
        stats
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).send('Terjadi kesalahan');
    }
  }
}

module.exports = new AuthController();
