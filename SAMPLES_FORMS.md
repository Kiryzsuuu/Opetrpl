# Sample Input (5x) untuk Form Fitur

Dokumen ini berisi contoh data yang bisa dipakai untuk memastikan form berjalan (terutama bagian yang sebelumnya berupa JSON).

Catatan:
- Di UI terbaru, kamu **tidak perlu mengetik JSON**. Cukup isi baris-baris input.
- Di backend, data tetap disimpan sebagai array objek.

## 1) Produksi — Peralatan (5 contoh baris)
1. Nama Alat: `Mixer` — Status: `OK`
2. Nama Alat: `Timbangan Digital` — Status: `Kalibrasi`
3. Nama Alat: `Sealer` — Status: `OK`
4. Nama Alat: `Thermometer` — Status: `OK`
5. Nama Alat: `Mesin Filling` — Status: `Perbaikan`

## 2) Produksi — Proses Produksi (5 contoh tahap)
1. Tahap: `Persiapan` — Mulai: `2026-01-05 08:00` — Selesai: `2026-01-05 08:15` — PIC: `Andi` — Catatan: `Cek kebersihan alat`
2. Tahap: `Mixing` — Mulai: `2026-01-05 08:15` — Selesai: `2026-01-05 09:00` — PIC: `Budi` — Catatan: `Kecepatan sedang`
3. Tahap: `Pemanasan` — Mulai: `2026-01-05 09:00` — Selesai: `2026-01-05 09:20` — PIC: `Citra` — Catatan: `Target 70C`
4. Tahap: `Cooling` — Mulai: `2026-01-05 09:20` — Selesai: `2026-01-05 09:40` — PIC: `Dewi` — Catatan: `Suhu turun stabil`
5. Tahap: `Packing` — Mulai: `2026-01-05 09:40` — Selesai: `2026-01-05 10:30` — PIC: `Eko` — Catatan: `Label lengkap`

## 3) Uji Lab — Parameter Uji (5 contoh baris)
1. Parameter: `TPC` — Nilai: `1` — Satuan: `CFU` — Status: `Lulus`
2. Parameter: `pH` — Nilai: `6.5` — Satuan: `pH` — Status: `Lulus`
3. Parameter: `Kadar Air` — Nilai: `12.1` — Satuan: `%` — Status: `Lulus`
4. Parameter: `Salmonella` — Nilai: `Negatif` — Satuan: `-` — Status: `Lulus`
5. Parameter: `Warna` — Nilai: `Normal` — Satuan: `-` — Status: `Lulus`

## 4) Pengemasan — Sertifikasi Keamanan (5 contoh baris)
1. Jenis Sertifikat: `BPOM` — Nomor: `MD-0001` — Tanggal berlaku: `2026-01-01`
2. Jenis Sertifikat: `Halal` — Nomor: `HALAL-0002` — Tanggal berlaku: `2026-01-02`
3. Jenis Sertifikat: `ISO 22000` — Nomor: `ISO-22000-0003` — Tanggal berlaku: `2026-01-03`
4. Jenis Sertifikat: `HACCP` — Nomor: `HACCP-0004` — Tanggal berlaku: `2026-01-04`
5. Jenis Sertifikat: `SNI` — Nomor: `SNI-0005` — Tanggal berlaku: `2026-01-05`

## 5) Pengemasan — Audit Trail (5 contoh baris)
1. Tanggal: `2026-01-05` — Aktivitas: `QC` — PIC: `admin` — Hasil: `OK`
2. Tanggal: `2026-01-05` — Aktivitas: `Metal Detector` — PIC: `admin` — Hasil: `OK`
3. Tanggal: `2026-01-05` — Aktivitas: `Label Check` — PIC: `admin` — Hasil: `OK`
4. Tanggal: `2026-01-05` — Aktivitas: `Sealing Check` — PIC: `admin` — Hasil: `OK`
5. Tanggal: `2026-01-05` — Aktivitas: `Final Packing` — PIC: `admin` — Hasil: `OK`

## 6) Komoditas (5 contoh)
1. Kode: `KMD001` — Nama: `Beras Organik` — Kategori: `Biji-bijian` — Satuan: `kg` — Harga: `15000` — Stok: `100` — Supplier: `Tani Sejahtera` — Status: `Tersedia`
2. Kode: `KMD002` — Nama: `Wortel` — Kategori: `Sayuran` — Satuan: `kg` — Harga: `12000` — Stok: `50` — Supplier: `Kebun Makmur` — Status: `Tersedia`
3. Kode: `KMD003` — Nama: `Pisang` — Kategori: `Buah` — Satuan: `kg` — Harga: `18000` — Stok: `40` — Supplier: `Buah Nusantara` — Status: `Tersedia`
4. Kode: `KMD004` — Nama: `Susu Bubuk` — Kategori: `Protein` — Satuan: `kg` — Harga: `75000` — Stok: `20` — Supplier: `Dairy Indo` — Status: `Pre-Order`
5. Kode: `KMD005` — Nama: `Garam` — Kategori: `Lainnya` — Satuan: `kg` — Harga: `8000` — Stok: `30` — Supplier: `Garam Jaya` — Status: `Tersedia`

## 7) Formulasi Pangan (5 contoh)
Catatan: Formulasi butuh Komposisi (pakai tombol "Tambah ke Komposisi").
1. Kode: `FRM001` — Nama: `Bubur Bayi Beras` — Kategori Produk: `Makanan Bayi` — Status: `Disetujui` — Komposisi: `Beras Organik 2 kg, Susu Bubuk 0.5 kg` — Cara Produksi: `Mixing + pemanasan`
2. Kode: `FRM002` — Nama: `Bubur Pisang` — Kategori Produk: `Makanan Bayi` — Status: `Disetujui` — Komposisi: `Pisang 1.5 kg, Beras Organik 1 kg` — Cara Produksi: `Blending + pemanasan`
3. Kode: `FRM003` — Nama: `Puree Wortel` — Kategori Produk: `MPASI` — Status: `Disetujui` — Komposisi: `Wortel 2 kg, Garam 0.05 kg` — Cara Produksi: `Steam + blending`
4. Kode: `FRM004` — Nama: `Bubur Kombo` — Kategori Produk: `MPASI` — Status: `Disetujui` — Komposisi: `Beras 1.5 kg, Wortel 0.5 kg` — Cara Produksi: `Mixing`
5. Kode: `FRM005` — Nama: `Bubur Protein` — Kategori Produk: `MPASI` — Status: `Disetujui` — Komposisi: `Susu Bubuk 0.7 kg, Beras 1.3 kg` — Cara Produksi: `Mixing`

## 8) Analisis Gizi (5 contoh)
1. Formulasi: `FRM001` — Kalori: `150` — Protein: `7` — Lemak: `3` — Karbohidrat: `25` — Serat: `2` — Gula: `4` — Natrium: `120` — Status: `Selesai`
2. Formulasi: `FRM002` — Kalori: `160` — Protein: `6` — Lemak: `4` — Karbohidrat: `28` — Serat: `2.5` — Gula: `6` — Natrium: `110` — Status: `Selesai`
3. Formulasi: `FRM003` — Kalori: `140` — Protein: `5` — Lemak: `2.5` — Karbohidrat: `24` — Serat: `3` — Gula: `5` — Natrium: `90` — Status: `Selesai`
4. Formulasi: `FRM004` — Kalori: `155` — Protein: `6.5` — Lemak: `3.2` — Karbohidrat: `26` — Serat: `2.2` — Gula: `4.2` — Natrium: `100` — Status: `Selesai`
5. Formulasi: `FRM005` — Kalori: `170` — Protein: `8` — Lemak: `4.5` — Karbohidrat: `29` — Serat: `2` — Gula: `4` — Natrium: `130` — Status: `Selesai`

## 9) Distribusi (5 contoh)
Catatan: Distribusi butuh Produksi status `Selesai`.
1. Kode Distribusi: `DST001` — Produksi: `PRD001` — Tanggal: `2026-01-05` — Tujuan: `Puskesmas A (Kota Demo)` — Jumlah: `10 pcs` — Status: `Persiapan`
2. Kode Distribusi: `DST002` — Produksi: `PRD002` — Tanggal: `2026-01-06` — Tujuan: `Posyandu B (Kota Demo)` — Jumlah: `12 pcs` — Status: `Dalam Perjalanan`
3. Kode Distribusi: `DST003` — Produksi: `PRD003` — Tanggal: `2026-01-07` — Tujuan: `Klinik C (Kota Demo)` — Jumlah: `8 pcs` — Status: `Sampai`
4. Kode Distribusi: `DST004` — Produksi: `PRD004` — Tanggal: `2026-01-08` — Tujuan: `Puskesmas D (Kota Demo)` — Jumlah: `15 pcs` — Status: `Persiapan`
5. Kode Distribusi: `DST005` — Produksi: `PRD005` — Tanggal: `2026-01-09` — Tujuan: `Posyandu E (Kota Demo)` — Jumlah: `9 pcs` — Status: `Persiapan`

## 10) Laporan (5 contoh yang bisa dicoba)
1. Jenis Laporan: `ringkasan` (tanpa tanggal)
2. Jenis Laporan: `komoditas` (tanpa tanggal)
3. Jenis Laporan: `formulasi` (tanpa tanggal)
4. Jenis Laporan: `produksi` (tanpa tanggal)
5. Jenis Laporan: `distribusi` (tanpa tanggal)
