# Sistem Manajemen Data Komoditas

Aplikasi web untuk mengelola data komoditas, formulasi pangan, analisis gizi, uji laboratorium, produksi, pengemasan, distribusi, dan laporan.

## Fitur Utama

- **UC01**: Kelola Komoditas
- **UC02**: Formulasi Pangan
- **UC03**: Analisis Gizi
- **UC04**: Hasil Uji Laboratorium
- **UC05**: Rencana Produksi
- **UC06**: Pengemasan & Keamanan Pangan
- **UC07**: Distribusi Produk
- **UC08**: Laporan
- **UC09**: Login & Autentikasi
- **UC10**: Notifikasi

## Role User

1. **Admin** - Akses penuh ke semua modul
2. **Peneliti** - Fokus pada formulasi, analisis gizi, dan uji lab
3. **Petugas Lapangan** - Fokus pada distribusi dan laporan lapangan

## Teknologi

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Template Engine**: EJS
- **Authentication**: Session-based dengan bcrypt

## Instalasi

```bash
# Install dependencies
npm install

# Setup database (pastikan MongoDB sudah running)
# Default: mongodb://localhost:27017/sistem_komoditas

# Jalankan aplikasi
npm start

# Development mode (auto-reload)
npm run dev
```

## Akses Aplikasi

URL: `http://localhost:3000`

### Default Accounts

**Admin**
- Username: admin
- Password: admin123

**Peneliti**
- Username: peneliti
- Password: peneliti123

**Petugas Lapangan**
- Username: petugas
- Password: petugas123

## Struktur Project

```
├── models/          # Mongoose schemas
├── controllers/     # Business logic
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static files (CSS, JS, images)
├── middleware/      # Custom middleware
├── config/          # Configuration files
└── app.js           # Main application file
```
