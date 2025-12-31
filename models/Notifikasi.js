const mongoose = require('mongoose');

const notifikasiSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  judul: {
    type: String,
    required: true
  },
  pesan: {
    type: String,
    required: true
  },
  tipe: {
    type: String,
    enum: ['Info', 'Warning', 'Success', 'Error'],
    default: 'Info'
  },
  kategori: {
    type: String,
    enum: ['Formulasi', 'Produksi', 'Distribusi', 'Uji Lab', 'Sistem', 'Lainnya'],
    default: 'Sistem'
  },
  link: String,
  dibaca: {
    type: Boolean,
    default: false
  },
  tanggalDibaca: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Notifikasi', notifikasiSchema);
