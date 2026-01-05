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
