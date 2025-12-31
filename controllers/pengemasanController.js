const Pengemasan = require('../models/Pengemasan');
const Produksi = require('../models/Produksi');
const { toCsv } = require('../utils/csv');

class PengemasanController {
  // List semua pengemasan
  async index(req, res) {
    try {
      const pengemasan = await Pengemasan.find()
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi', select: 'nama kode' }
        })
        .populate('penanggungJawab', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('pengemasan/index', {
        title: 'Pengemasan & Keamanan Pangan',
        pengemasan,
        items: pengemasan,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching pengemasan:', error);
      req.flash('error', 'Gagal memuat data pengemasan');
      res.redirect('/dashboard');
    }
  }

  // Form tambah pengemasan
  async create(req, res) {
    try {
      const produksiId = req.query.produksi;
      const produksi = await Produksi.find({ status: 'Selesai' })
        .populate('formulasi', 'nama kode');
      const selectedProduksi = produksiId 
        ? await Produksi.findById(produksiId).populate('formulasi') 
        : null;
      
      res.render('pengemasan/create', {
        title: 'Tambah Pengemasan',
        produksi,
        selectedProduksi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/pengemasan');
    }
  }

  // Proses tambah pengemasan
  async store(req, res) {
    try {
      const pengemasanData = {
        ...req.body,
        penanggungJawab: req.session.userId,
        sertifikasiKeamanan: JSON.parse(req.body.sertifikasiKeamanan || '[]'),
        auditTrail: JSON.parse(req.body.auditTrail || '[]'),
        labelNutrisi: req.body.labelNutrisi === 'true',
        labelHalal: req.body.labelHalal === 'true'
      };
      
      await Pengemasan.create(pengemasanData);
      
      req.flash('success', 'Data pengemasan berhasil ditambahkan');
      res.redirect('/pengemasan');
    } catch (error) {
      console.error('Error creating pengemasan:', error);
      req.flash('error', 'Gagal menambahkan data pengemasan');
      res.redirect('/pengemasan/new');
    }
  }

  // Detail pengemasan
  async show(req, res) {
    try {
      const pengemasan = await Pengemasan.findById(req.params.id)
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi' }
        })
        .populate('penanggungJawab', 'nama email')
        .populate('auditTrail.pic', 'nama');
      
      if (!pengemasan) {
        req.flash('error', 'Data pengemasan tidak ditemukan');
        return res.redirect('/pengemasan');
      }
      
      res.render('pengemasan/show', {
        title: 'Detail Pengemasan',
        pengemasan,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching pengemasan:', error);
      req.flash('error', 'Gagal memuat detail pengemasan');
      res.redirect('/pengemasan');
    }
  }

  // Form edit pengemasan
  async edit(req, res) {
    try {
      const pengemasan = await Pengemasan.findById(req.params.id)
        .populate('produksi');
      
      if (!pengemasan) {
        req.flash('error', 'Data pengemasan tidak ditemukan');
        return res.redirect('/pengemasan');
      }
      
      const produksi = await Produksi.find({ status: 'Selesai' })
        .populate('formulasi', 'nama kode');
      
      res.render('pengemasan/edit', {
        title: 'Edit Pengemasan',
        pengemasan,
        produksi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching pengemasan:', error);
      req.flash('error', 'Gagal memuat data pengemasan');
      res.redirect('/pengemasan');
    }
  }

  // Proses update pengemasan
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        sertifikasiKeamanan: JSON.parse(req.body.sertifikasiKeamanan || '[]'),
        auditTrail: JSON.parse(req.body.auditTrail || '[]'),
        labelNutrisi: req.body.labelNutrisi === 'true',
        labelHalal: req.body.labelHalal === 'true'
      };
      
      await Pengemasan.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Data pengemasan berhasil diupdate');
      res.redirect('/pengemasan');
    } catch (error) {
      console.error('Error updating pengemasan:', error);
      req.flash('error', 'Gagal mengupdate data pengemasan');
      res.redirect(`/pengemasan/${req.params.id}/edit`);
    }
  }

  // Hapus pengemasan
  async destroy(req, res) {
    try {
      await Pengemasan.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Data pengemasan berhasil dihapus');
      res.redirect('/pengemasan');
    } catch (error) {
      console.error('Error deleting pengemasan:', error);
      req.flash('error', 'Gagal menghapus data pengemasan');
      res.redirect('/pengemasan');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const pengemasan = await Pengemasan.find()
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi', select: 'nama kode' }
        })
        .populate('penanggungJawab', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'tanggalKemas', label: 'Tanggal Kemas' },
        { key: 'kodeProduksi', label: 'Kode Produksi' },
        { key: 'batchNumber', label: 'Batch Produksi' },
        { key: 'jenisPengemas', label: 'Jenis Pengemas' },
        { key: 'jumlahKemasan', label: 'Jumlah Kemasan' },
        { key: 'tanggalKadaluarsa', label: 'Tanggal Kadaluarsa' },
        { key: 'labelNutrisi', label: 'Label Nutrisi' },
        { key: 'labelHalal', label: 'Label Halal' },
        { key: 'status', label: 'Status' },
        { key: 'penanggungJawab', label: 'Penanggung Jawab' }
      ];

      const rows = pengemasan.map((p) => ({
        tanggalKemas: p.tanggalKemas ? new Date(p.tanggalKemas).toLocaleDateString('id-ID') : '',
        kodeProduksi: p.produksi && p.produksi.kodeProduksi ? p.produksi.kodeProduksi : '',
        batchNumber: p.produksi && p.produksi.batchNumber ? p.produksi.batchNumber : '',
        jenisPengemas: p.jenisPengemas || '',
        jumlahKemasan: p.jumlahKemasan != null ? p.jumlahKemasan : '',
        tanggalKadaluarsa: p.tanggalKadaluarsa ? new Date(p.tanggalKadaluarsa).toLocaleDateString('id-ID') : '',
        labelNutrisi: p.labelNutrisi ? 'Ya' : 'Tidak',
        labelHalal: p.labelHalal ? 'Ya' : 'Tidak',
        status: p.status || '',
        penanggungJawab: p.penanggungJawab && p.penanggungJawab.nama ? p.penanggungJawab.nama : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `pengemasan_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting pengemasan CSV:', error);
      req.flash('error', 'Gagal export CSV pengemasan');
      return res.redirect('/pengemasan');
    }
  }
}

module.exports = new PengemasanController();
