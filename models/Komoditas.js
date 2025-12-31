const mongoose = require('mongoose');

const komoditasSchema = new mongoose.Schema({
  kode: {
    type: String,
    required: true,
    unique: true
  },
  nama: {
    type: String,
    required: true
  },
  kategori: {
    type: String,
    required: true,
    enum: ['Sayuran', 'Buah', 'Biji-bijian', 'Protein', 'Lainnya']
  },
  deskripsi: String,
  satuan: {
    type: String,
    default: 'kg'
  },
  hargaPerSatuan: {
    type: Number,
    default: 0
  },
  stok: {
    type: Number,
    default: 0
  },
  supplier: String,
  tanggalMasuk: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Tersedia', 'Habis', 'Pre-Order'],
    default: 'Tersedia'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Komoditas', komoditasSchema);
