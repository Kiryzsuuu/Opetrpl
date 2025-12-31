# Quick Start Guide - 5 Menit Setup

## Step 1: Pastikan MongoDB Running ⚡

**Windows:**
```bash
# Buka MongoDB Compass ATAU jalankan di terminal:
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

**Atau gunakan MongoDB Atlas (Cloud) - Gratis:**
1. Buat account di https://www.mongodb.com/cloud/atlas
2. Buat cluster (free tier)
3. Copy connection string
4. Paste ke `.env` → `MONGODB_URI=`

## Step 2: Install Dependencies (Sudah Selesai ✅)

Dependencies sudah terinstall. Jika perlu install ulang:
```bash
npm install
```

## Step 3: Seed Database (Data Awal)

```bash
node seed.js
```

Output:
```
✓ MongoDB terhubung
✓ Users created
✓ Komoditas created
✓ Formulasi created

Default Login Credentials:
Admin: admin / admin123
Peneliti: peneliti / peneliti123
Petugas: petugas / petugas123
```

## Step 4: Jalankan Aplikasi

```bash
npm start
```

Output:
```
✓ MongoDB terhubung
✓ Default user created: admin
✓ Default user created: peneliti
✓ Default user created: petugas
✓ Server berjalan di http://localhost:3000
✓ Environment: development
```

## Step 5: Buka Browser

Akses: **http://localhost:3000**

Login dengan:
- Username: `admin`
- Password: `admin123`

---

## 🎯 Apa yang Bisa Anda Lakukan Sekarang?

### ✅ Sudah Berfungsi (Bisa Dicoba Langsung)

1. **Login** dengan 3 role berbeda
2. **Dashboard** melihat statistik
3. **Komoditas**:
   - Lihat list komoditas
   - Tambah komoditas baru (Admin)
   - Detail komoditas
4. **Menu navigasi** role-based sudah berfungsi

### ⚠️ Backend Ready, Views Perlu Dilengkapi

**Backend sudah 100% siap, tinggal buat halaman UI:**
- Formulasi Pangan
- Analisis Gizi
- Uji Laboratorium
- Produksi
- Pengemasan
- Distribusi
- Laporan
- Notifikasi

**Cara melengkapi:** Lihat file `VIEWS_TEMPLATE.md`

---

## 🔑 Default Login Accounts

| Role | Username | Password | Akses |
|------|----------|----------|-------|
| **Admin** | admin | admin123 | Full access semua modul |
| **Peneliti** | peneliti | peneliti123 | Formulasi, Analisis Gizi, Uji Lab |
| **Petugas Lapangan** | petugas | petugas123 | Distribusi, Laporan |

---

## 📂 File Penting

| File | Fungsi |
|------|--------|
| `app.js` | Server utama |
| `package.json` | Dependencies |
| `.env` | Konfigurasi (port, database) |
| `seed.js` | Data awal |
| `STATUS.md` | Status implementasi lengkap |
| `VIEWS_TEMPLATE.md` | Panduan buat views |
| `INSTALASI.md` | Dokumentasi detail |

---

## 🐛 Troubleshooting Cepat

**Error: Cannot connect to MongoDB**
```bash
# Pastikan MongoDB running
mongod

# Atau cek service status (Linux)
sudo systemctl status mongod
```

**Error: Port 3000 already in use**
```bash
# Edit .env, ubah PORT
PORT=3001
```

**Error: Module not found**
```bash
npm install
```

**Lupa password?**
```bash
# Jalankan seed ulang
node seed.js
```

---

## 🎓 Tutorial Cepat: Buat View Baru

**Contoh: Membuat views/formulasi/index.ejs**

1. Copy dari `views/komoditas/index.ejs`
2. Find & Replace: `komoditas` → `formulasi`
3. Update kolom tabel sesuai model Formulasi:
   ```ejs
   <th>Kode</th>
   <th>Nama</th>
   <th>Kategori Produk</th>
   <th>Peneliti</th>
   <th>Status</th>
   <th>Aksi</th>
   ```
4. Update data loop:
   ```ejs
   <% formulasi.forEach(f => { %>
     <td><%= f.kode %></td>
     <td><%= f.nama %></td>
     ...
   <% }) %>
   ```

**Waktu: ~10-15 menit per modul**

---

## 📊 Progress Tracker

- [x] Setup Project
- [x] Database Models (10/10)
- [x] Controllers (10/10)
- [x] Routes (10/10)
- [x] Authentication & Authorization
- [x] Core Views (Login, Dashboard, Layout)
- [x] Sample Module (Komoditas - partial)
- [ ] Complete Views untuk 8 modul lainnya
- [ ] Testing
- [ ] Deployment

---

## 🚀 Next Steps

### Untuk Demo (1-2 jam):
1. Lengkapi views/komoditas (edit.ejs, show.ejs)
2. Buat views/formulasi (copy dari komoditas)
3. Buat views/laporan (simple form + hasil)
4. Test flow: Login → Tambah Komoditas → Buat Formulasi → Laporan

### Untuk Production (4-6 jam):
1. Lengkapi semua views (9 modul)
2. Testing menyeluruh
3. Error handling & validation
4. UI/UX polish
5. Deploy ke Heroku/Railway

---

## 💡 Tips

1. **Gunakan MongoDB Compass** untuk monitor database
2. **Gunakan Thunder Client (VS Code)** untuk test API
3. **Copy-paste pattern** dari komoditas untuk modul lain
4. **Test dengan 3 role** untuk validasi authorization
5. **Commit ke Git** setiap selesai 1 modul

---

## 📞 Help & Resources

- **STATUS.md** - Status implementasi detail
- **VIEWS_TEMPLATE.md** - Template lengkap untuk views
- **INSTALASI.md** - Dokumentasi instalasi lengkap
- **README.md** - Overview project

---

## ✅ Checklist Sebelum Demo

- [ ] MongoDB running
- [ ] npm install selesai
- [ ] node seed.js berhasil
- [ ] npm start berjalan tanpa error
- [ ] Login berhasil dengan admin
- [ ] Dashboard muncul dengan benar
- [ ] Bisa tambah komoditas
- [ ] Menu navigasi berfungsi

---

**Selamat mencoba! Jika ada error, cek troubleshooting di atas atau baca INSTALASI.md** 🎉
