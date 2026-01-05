require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/database');
const { injectUser, injectNotifications } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-change-me';
if (!process.env.SESSION_SECRET) {
  console.warn('[WARN] SESSION_SECRET belum diset. Set SESSION_SECRET di environment (Vercel).');
}

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Trust proxy (needed for secure cookies behind Vercel/Reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash messages
app.use(flash());

// Inject user dan notifikasi ke views
app.use(injectUser);
app.use(injectNotifications);

// Routes
app.use('/', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/komoditas', require('./routes/komoditas'));
app.use('/formulasi', require('./routes/formulasi'));
app.use('/analisis-gizi', require('./routes/analisis-gizi'));
app.use('/uji-lab', require('./routes/uji-lab'));
app.use('/produksi', require('./routes/produksi'));
app.use('/pengemasan', require('./routes/pengemasan'));
app.use('/distribusi', require('./routes/distribusi'));
app.use('/laporan', require('./routes/laporan'));
app.use('/notifikasi', require('./routes/notifikasi'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Halaman Tidak Ditemukan',
    message: 'Halaman yang Anda cari tidak ditemukan',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Export app for serverless (Vercel) and only listen when run directly
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Server berjalan di http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
