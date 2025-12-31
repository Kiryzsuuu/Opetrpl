const mongoose = require('mongoose');

const formulasiSchema = new mongoose.Schema({
  kode: {
    type: String,
    required: true,
    unique: true
  },
  nama: {
    type: String,
    required: true
  },
  deskripsi: String,
  kategoriProduk: {
    type: String,
    required: true
  },
  komposisi: [{
    komoditas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Komoditas',
      required: true
    },
    jumlah: {
      type: Number,
      required: true
    },
    satuan: String,
    persentase: Number
  }],
  caraProduksi: {
    type: String,
    required: true
  },
  estimasiWaktuProduksi: String,
  targetHasil: {
    jumlah: Number,
    satuan: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Disetujui', 'Produksi', 'Ditolak'],
    default: 'Draft'
  },
  peneliti: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tanggalDibuat: {
    type: Date,
    default: Date.now
  },
  tanggalDisetujui: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Formulasi', formulasiSchema);
