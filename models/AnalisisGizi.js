const mongoose = require('mongoose');

const analisisGiziSchema = new mongoose.Schema({
  formulasi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formulasi',
    required: true
  },
  tanggalAnalisis: {
    type: Date,
    default: Date.now
  },
  analisis: {
    kalori: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    lemak: { type: Number, default: 0 },
    karbohidrat: { type: Number, default: 0 },
    serat: { type: Number, default: 0 },
    gula: { type: Number, default: 0 },
    natrium: { type: Number, default: 0 },
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    kalsium: { type: Number, default: 0 },
    zatBesi: { type: Number, default: 0 }
  },
  metodePengujian: String,
  catatan: String,
  kesimpulan: String,
  rekomendasi: String,
  status: {
    type: String,
    enum: ['Pending', 'Selesai', 'Perlu Review'],
    default: 'Pending'
  },
  analis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnalisisGizi', analisisGiziSchema);
