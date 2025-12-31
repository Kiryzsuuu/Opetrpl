# Template Views untuk Modul Lainnya

Karena keterbatasan, hanya template komoditas yang dibuat lengkap. Untuk modul lainnya, gunakan struktur yang sama dengan menyesuaikan field-nya.

## Struktur View Standard

Setiap modul memiliki 5 file view standard:

1. **index.ejs** - List/tabel data
2. **create.ejs** - Form tambah data baru
3. **edit.ejs** - Form edit data (mirip create.ejs, pre-filled dengan data existing)
4. **show.ejs** - Detail data (read-only)

## Cara Membuat View untuk Modul Lain

### 1. Formulasi (views/formulasi/)

Copy struktur dari komoditas, tambahkan:
- Select dropdown untuk memilih komoditas (multi-select)
- Dynamic form untuk komposisi (JavaScript untuk add/remove rows)
- Textarea untuk cara produksi
- Status dropdown (Draft, Disetujui, Produksi, Ditolak)

### 2. Analisis Gizi (views/analisis-gizi/)

Form fields:
- Dropdown pilih formulasi
- Input fields untuk nilai gizi (kalori, protein, lemak, karbohidrat, dll)
- Textarea untuk metodePengujian, catatan, kesimpulan
- Status dropdown

### 3. Uji Lab (views/uji-lab/)

Form fields:
- Dropdown pilih formulasi
- Input kodeUji, jenisUji, tanggalUji, laboratorium
- Dynamic form untuk parameter uji (parameter, nilai, satuan, status)
- Textarea untuk catatan dan rekomendasi

### 4. Produksi (views/produksi/)

Form fields:
- Dropdown pilih formulasi
- Input kodeProduksi, tanggalProduksi, batchNumber
- Target dan hasil produksi (jumlah, satuan)
- Dynamic form untuk peralatan
- Dynamic form untuk proses produksi (tahap, waktu, PIC, catatan)
- Status dropdown

### 5. Pengemasan (views/pengemasan/)

Form fields:
- Dropdown pilih produksi
- Input tanggalKemas, jenisPengemas, ukuranKemasan, jumlahKemasan
- Checkbox untuk labelNutrisi dan labelHalal
- Dynamic form untuk sertifikasi keamanan
- Dynamic form untuk audit trail

### 6. Distribusi (views/distribusi/)

Form fields:
- Dropdown pilih produksi
- Input kodeDistribusi, tanggalDistribusi, jumlahProduk
- Nested object untuk tujuan (nama, alamat, kota, provinsi, kodePos, kontak)
- Nested object untuk penerima (nama, jabatan, kontak)
- Nested object untuk kurir (nama, noKendaraan, kontak)
- Status dropdown

### 7. Laporan (views/laporan/)

- index.ejs: Form filter (jenis laporan, tanggal mulai, tanggal akhir)
- hasil.ejs: Tampilkan hasil laporan dalam tabel/cards

### 8. Notifikasi (views/notifikasi/)

- index.ejs: List notifikasi dengan badge belum dibaca
- Tombol "Tandai Semua Sudah Dibaca"

## Tips Cepat Membuat Views

1. Copy file dari komoditas
2. Find & Replace:
   - "komoditas" → nama modul baru
   - "Komoditas" → Nama Modul Baru (capitalize)
3. Sesuaikan field form dengan model
4. Update route links
5. Test dengan controller yang sudah dibuat

## Contoh Cepat - Buat views/formulasi/index.ejs

```ejs
<!-- Copy dari views/komoditas/index.ejs -->
<!-- Ganti semua "komoditas" jadi "formulasi" -->
<!-- Ganti kolom tabel sesuai model Formulasi -->
<th>Kode</th>
<th>Nama</th>
<th>Kategori Produk</th>
<th>Peneliti</th>
<th>Status</th>
<th>Tanggal</th>
<th>Aksi</th>
```

## Dynamic Form Components (untuk komposisi, parameter, dll)

```html
<!-- Tambahkan di create.ejs/edit.ejs -->
<div id="komposisi-container">
  <div class="komposisi-item">
    <select name="komoditas[]" class="form-select" required>
      <!-- Options dari database -->
    </select>
    <input type="number" name="jumlah[]" class="form-control" required>
    <button type="button" class="btn btn-danger remove-item">Hapus</button>
  </div>
</div>
<button type="button" id="add-komposisi" class="btn btn-secondary">Tambah Komposisi</button>

<script>
document.getElementById('add-komposisi').addEventListener('click', function() {
  // Clone dan append komposisi-item
});
</script>
```

## Prioritas Pembuatan Views

Jika waktu terbatas, buat dengan urutan prioritas:

1. ✅ Login (sudah ada)
2. ✅ Dashboard (sudah ada)
3. ✅ Komoditas (sudah ada - template untuk yang lain)
4. Formulasi (UC02 - critical)
5. Produksi (UC05 - critical)
6. Distribusi (UC07 - critical)
7. Laporan (UC08 - untuk demo)
8. Notifikasi (UC10 - simple)
9. Analisis Gizi (UC03 - optional)
10. Uji Lab (UC04 - optional)
11. Pengemasan (UC06 - optional)

## Testing Checklist

- [ ] Login dengan 3 role berbeda
- [ ] Create data di setiap modul
- [ ] Read/view detail data
- [ ] Update data
- [ ] Delete data
- [ ] Check role-based access control
- [ ] Generate laporan
- [ ] Check notifikasi
