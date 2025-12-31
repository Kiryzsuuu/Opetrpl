const mongoose = require('mongoose');

const ujiLabSchema = new mongoose.Schema({
  formulasi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formulasi',
    required: true
  },
  kodeUji: {
    type: String,
    required: true,
    unique: true
  },
  jenisUji: {
    type: String,
    required: true,
    enum: ['Mikrobiologi', 'Kimia', 'Fisik', 'Sensori', 'Keamanan Pangan']
  },
  tanggalUji: {
    type: Date,
    required: true
  },
  laboratorium: String,
  parameterUji: [{
    parameter: String,
    nilai: String,
    satuan: String,
    batasMaksimal: String,
    status: {
      type: String,
      enum: ['Lulus', 'Tidak Lulus', 'Pending']
    }
  }],
  hasilUji: {
    type: String,
    enum: ['Lulus', 'Tidak Lulus', 'Pending'],
    default: 'Pending'
  },
  catatan: String,
  rekomendasi: String,
  dokumenPendukung: String,
  penanggungJawab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UjiLab', ujiLabSchema);
