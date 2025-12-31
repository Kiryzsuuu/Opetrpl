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

Login menggunakan **email**.

**Admin**
- Email: admin@sistem.com
- Password: admin123

**Peneliti**
- Email: peneliti@sistem.com
- Password: peneliti123

**Petugas Lapangan**
- Email: petugas@sistem.com
- Password: petugas123

## Forgot Password (Email)

Fitur lupa password mengirim link reset via email. Tambahkan env berikut pada file `.env` (lihat `.env.example`):

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `APP_BASE_URL` (opsional)
- `APP_NAME` (opsional)
- `MAIL_FROM` (opsional)

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
