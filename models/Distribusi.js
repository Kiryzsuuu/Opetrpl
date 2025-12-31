const mongoose = require('mongoose');

const distribusiSchema = new mongoose.Schema({
  kodeDistribusi: {
    type: String,
    required: true,
    unique: true
  },
  produksi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produksi',
    required: true
  },
  pengemasan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengemasan'
  },
  tanggalDistribusi: {
    type: Date,
    required: true
  },
  tujuan: {
    nama: String,
    alamat: String,
    kota: String,
    provinsi: String,
    kodePos: String,
    kontak: String
  },
  jumlahProduk: {
    type: Number,
    required: true
  },
  satuan: String,
  penerima: {
    nama: String,
    jabatan: String,
    kontak: String
  },
  kurir: {
    nama: String,
    noKendaraan: String,
    kontak: String
  },
  estimasiSampai: Date,
  tanggalSampai: Date,
  status: {
    type: String,
    enum: ['Persiapan', 'Dalam Perjalanan', 'Sampai', 'Dibatalkan'],
    default: 'Persiapan'
  },
  catatan: String,
  buktiPengiriman: String,
  petugas: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Distribusi', distribusiSchema);
