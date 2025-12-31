const User = require('../models/User');

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
      const { username, password } = req.body;
      
      const user = await User.findOne({ username, status: 'Aktif' });
      
      if (!user) {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      req.flash('error', 'Username atau password salah');
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
      const { username, email, password, confirmPassword, nama, noTelepon } = req.body;

      // Validasi password match
      if (password !== confirmPassword) {
        req.flash('error', 'Password dan Konfirmasi Password tidak sama');
        return res.redirect('/register');
      }

      // Cek apakah username sudah ada
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        req.flash('error', 'Username sudah digunakan');
        return res.redirect('/register');
      }

      // Cek apakah email sudah ada
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        req.flash('error', 'Email sudah terdaftar');
        return res.redirect('/register');
      }

      // Buat user baru dengan role default "Petugas Lapangan"
      const newUser = new User({
        username,
        email,
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
