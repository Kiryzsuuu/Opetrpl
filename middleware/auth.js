// Middleware untuk cek autentikasi
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu');
  res.redirect('/login');
}

// Middleware untuk cek role
function hasRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error', 'Silakan login terlebih dahulu');
      return res.redirect('/login');
    }
    
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    
    req.flash('error', 'Anda tidak memiliki akses ke halaman ini');
    res.redirect('/dashboard');
  };
}

// Middleware untuk inject user ke locals (tersedia di semua views)
function injectUser(req, res, next) {
  res.locals.user = req.session.user || null;
  next();
}

// Middleware untuk inject notifikasi belum dibaca
async function injectNotifications(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const Notifikasi = require('../models/Notifikasi');
      const unreadCount = await Notifikasi.countDocuments({
        user: req.session.userId,
        dibaca: false
      });
      res.locals.unreadNotifications = unreadCount;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.locals.unreadNotifications = 0;
    }
  } else {
    res.locals.unreadNotifications = 0;
  }
  next();
}

module.exports = {
  isAuthenticated,
  hasRole,
  injectUser,
  injectNotifications
};
