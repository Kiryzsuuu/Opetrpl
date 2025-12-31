const mongoose = require('mongoose');

const produksiSchema = new mongoose.Schema({
  kodeProduksi: {
    type: String,
    required: true,
    unique: true
  },
  formulasi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formulasi',
    required: true
  },
  tanggalProduksi: {
    type: Date,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  targetProduksi: {
    jumlah: Number,
    satuan: String
  },
  hasilProduksi: {
    jumlah: Number,
    satuan: String
  },
  peralatan: [{
    namaAlat: String,
    status: String
  }],
  prosesProduksi: [{
    tahap: String,
    waktuMulai: Date,
    waktuSelesai: Date,
    pic: String,
    catatan: String
  }],
  status: {
    type: String,
    enum: ['Perencanaan', 'Proses', 'Selesai', 'Dibatalkan'],
    default: 'Perencanaan'
  },
  kualitas: {
    type: String,
    enum: ['A', 'B', 'C', 'Reject'],
    default: 'A'
  },
  catatan: String,
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Produksi', produksiSchema);
