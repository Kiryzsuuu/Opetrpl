# Panduan Instalasi dan Menjalankan Aplikasi

## Prasyarat

1. **Node.js** (v14 atau lebih baru)
   - Download: https://nodejs.org/
   - Cek instalasi: `node --version`

2. **MongoDB** (v4.4 atau lebih baru)
   - Download: https://www.mongodb.com/try/download/community
   - Atau gunakan MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Cek instalasi: `mongod --version`

## Langkah Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

File `.env` sudah tersedia dengan konfigurasi default:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sistem_komoditas
SESSION_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Jika menggunakan MongoDB Atlas:**
- Ganti `MONGODB_URI` dengan connection string dari MongoDB Atlas
- Format: `mongodb+srv://username:password@cluster.mongodb.net/sistem_komoditas`

### 3. Jalankan MongoDB (jika menggunakan local)

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Seed Database (Opsional - untuk data awal)

```bash
node seed.js
```

Ini akan membuat:
- 3 user default (admin, peneliti, petugas)
- 5 komoditas sample
- 2 formulasi sample

### 5. Jalankan Aplikasi

**Mode Production:**
```bash
npm start
```

**Mode Development (auto-reload):**
```bash
npm run dev
```

### 6. Akses Aplikasi

Buka browser dan akses: **http://localhost:3000**

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Peneliti | peneliti | peneliti123 |
| Petugas Lapangan | petugas | petugas123 |

## Troubleshooting

### Error: Cannot connect to MongoDB

**Solusi:**
1. Pastikan MongoDB sudah running: `mongod` (Windows) atau `sudo systemctl status mongod` (Linux)
2. Cek connection string di file `.env`
3. Pastikan port 27017 tidak digunakan aplikasi lain

### Error: Port 3000 already in use

**Solusi:**
1. Ubah PORT di file `.env` menjadi port lain (contoh: 3001)
2. Atau matikan aplikasi yang menggunakan port 3000

### Error: Module not found

**Solusi:**
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

### Error: Cannot find module 'dotenv'

**Solusi:**
```bash
npm install dotenv
```

## Fitur yang Tersedia

### Role: Admin
- ✅ Kelola Komoditas (CRUD)
- ✅ Kelola Formulasi (CRUD)
- ✅ Kelola Produksi (CRUD)
- ✅ Kelola Pengemasan (CRUD)
- ✅ Kelola Distribusi (CRUD)
- ✅ Laporan
- ✅ Notifikasi

### Role: Peneliti
- ✅ Buat & Edit Formulasi
- ✅ Analisis Gizi (CRUD)
- ✅ Uji Laboratorium (CRUD)
- ✅ Laporan
- ✅ Notifikasi

### Role: Petugas Lapangan
- ✅ Kelola Distribusi (CRUD)
- ✅ Laporan
- ✅ Notifikasi

## Struktur Project

```
├── models/          # Mongoose schemas (10 models)
├── controllers/     # Business logic (10 controllers)
├── routes/          # Express routes (10 route files)
├── views/           # EJS templates
│   ├── auth/        # Login
│   ├── komoditas/   # Views komoditas
│   ├── formulasi/   # Views formulasi
│   ├── ...          # (views lainnya)
│   └── partials/    # Reusable components
├── middleware/      # Authentication middleware
├── config/          # Database config
├── public/          # Static files (CSS, JS)
├── app.js           # Main application
├── seed.js          # Database seeder
└── .env             # Environment variables
```

## Development Tips

### 1. Auto-reload dengan Nodemon

```bash
npm run dev
```

### 2. Check MongoDB Data

Gunakan MongoDB Compass atau mongosh:
```bash
mongosh
use sistem_komoditas
db.users.find()
```

### 3. Reset Database

```bash
# Masuk ke mongosh
mongosh

# Pilih database
use sistem_komoditas

# Hapus semua collections
db.dropDatabase()

# Keluar dan jalankan seed lagi
exit
node seed.js
```

### 4. Membuat Views untuk Modul Lain

Lihat file `VIEWS_TEMPLATE.md` untuk panduan membuat views untuk modul yang belum dibuat.

## Production Deployment

### 1. Set Environment Variables

```bash
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
SESSION_SECRET=<strong-random-secret>
```

### 2. Deploy ke Heroku/Railway/Vercel

**Contoh Heroku:**
```bash
heroku create nama-app
heroku config:set MONGODB_URI=<connection-string>
heroku config:set SESSION_SECRET=<secret-key>
git push heroku main
```

### 3. Monitoring

- Gunakan PM2 untuk production: `npm install -g pm2`
- Jalankan dengan PM2: `pm2 start app.js --name sistem-komoditas`
- Monitor: `pm2 monit`

## Testing

### Manual Testing Checklist

- [ ] Login dengan setiap role
- [ ] Create data di setiap modul
- [ ] Edit data
- [ ] Delete data
- [ ] Generate laporan
- [ ] Check notifikasi
- [ ] Test role-based access control

### API Testing (Optional)

Jika ingin test dengan Postman/Thunder Client:
- Base URL: `http://localhost:3000`
- Endpoints mengikuti RESTful pattern
- Authentication: Session-based (cookie)

## Support & Dokumentasi

- **README.md**: Overview aplikasi
- **VIEWS_TEMPLATE.md**: Panduan membuat views tambahan
- **Models**: Cek file di `models/` untuk struktur data
- **Controllers**: Cek file di `controllers/` untuk business logic

## Next Steps

1. ✅ Install dependencies
2. ✅ Setup MongoDB
3. ✅ Run seed.js
4. ✅ Start aplikasi
5. ⏭️ Login dan test fitur
6. ⏭️ Buat views tambahan sesuai kebutuhan (lihat VIEWS_TEMPLATE.md)
7. ⏭️ Deploy ke production (optional)
