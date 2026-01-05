const mongoose = require('mongoose');

const pengemasanSchema = new mongoose.Schema({
  produksi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produksi',
    required: true
  },
  tanggalKemas: {
    type: Date,
    required: true
  },
  jenisPengemas: {
    type: String,
    required: true
  },
  ukuranKemasan: String,
  jumlahKemasan: {
    type: Number,
    required: true
  },
  beratPerKemasan: Number,
  nomorBatch: String,
  tanggalKadaluarsa: Date,
  labelNutrisi: {
    type: Boolean,
    default: false
  },
  labelHalal: {
    type: Boolean,
    default: false
  },
  sertifikasiKeamanan: [{
    jenisSertifikat: String,
    nomorSertifikat: String,
    tanggalBerlaku: Date
  }],
  standarKeamanan: String,
  auditTrail: [{
    tanggal: Date,
    aktivitas: String,
    pic: String,
    hasil: String
  }],
  catatan: String,
  status: {
    type: String,
    enum: ['Pending', 'Selesai', 'Gagal'],
    default: 'Pending'
  },
  penanggungJawab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pengemasan', pengemasanSchema);
