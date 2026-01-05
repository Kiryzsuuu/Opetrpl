const Produksi = require('../models/Produksi');
const Formulasi = require('../models/Formulasi');
const { toCsv } = require('../utils/csv');
const { parseJsonArray } = require('../utils/json');

class ProduksiController {
  // List semua produksi
  async index(req, res) {
    try {
      const produksi = await Produksi.find()
        .populate('formulasi', 'nama kode')
        .populate('supervisor', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('produksi/index', {
        title: 'Rencana Produksi',
        produksi,
        items: produksi,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching produksi:', error);
      req.flash('error', 'Gagal memuat data produksi');
      res.redirect('/dashboard');
    }
  }

  // Form tambah produksi
  async create(req, res) {
    try {
      const formulasi = await Formulasi.find({ status: 'Disetujui' });
      
      res.render('produksi/create', {
        title: 'Buat Rencana Produksi',
        formulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/produksi');
    }
  }

  // Proses tambah produksi
  async store(req, res) {
    try {
      const produksiData = {
        ...req.body,
        supervisor: req.session.userId,
        peralatan: parseJsonArray(req.body.peralatan),
        prosesProduksi: parseJsonArray(req.body.prosesProduksi),
        targetProduksi: {
          jumlah: req.body.targetJumlah,
          satuan: req.body.targetSatuan
        },
        hasilProduksi: {
          jumlah: req.body.hasilJumlah || 0,
          satuan: req.body.hasilSatuan || req.body.targetSatuan
        }
      };
      
      await Produksi.create(produksiData);
      
      req.flash('success', 'Rencana produksi berhasil dibuat');
      res.redirect('/produksi');
    } catch (error) {
      console.error('Error creating produksi:', error);
      req.flash('error', 'Gagal membuat rencana produksi');
      res.redirect('/produksi/new');
    }
  }

  // Detail produksi
  async show(req, res) {
    try {
      const produksi = await Produksi.findById(req.params.id)
        .populate('formulasi')
        .populate('supervisor', 'nama email');
      
      if (!produksi) {
        req.flash('error', 'Data produksi tidak ditemukan');
        return res.redirect('/produksi');
      }
      
      // Cek pengemasan terkait
      const Pengemasan = require('../models/Pengemasan');
      const pengemasan = await Pengemasan.find({ produksi: produksi._id })
        .populate('penanggungJawab', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('produksi/show', {
        title: 'Detail Produksi',
        produksi,
        pengemasan,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching produksi:', error);
      req.flash('error', 'Gagal memuat detail produksi');
      res.redirect('/produksi');
    }
  }

  // Form edit produksi
  async edit(req, res) {
    try {
      const produksi = await Produksi.findById(req.params.id)
        .populate('formulasi');
      
      if (!produksi) {
        req.flash('error', 'Data produksi tidak ditemukan');
        return res.redirect('/produksi');
      }
      
      const formulasi = await Formulasi.find({ status: 'Disetujui' });
      
      res.render('produksi/edit', {
        title: 'Edit Rencana Produksi',
        produksi,
        formulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching produksi:', error);
      req.flash('error', 'Gagal memuat data produksi');
      res.redirect('/produksi');
    }
  }

  // Proses update produksi
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        peralatan: parseJsonArray(req.body.peralatan),
        prosesProduksi: parseJsonArray(req.body.prosesProduksi),
        targetProduksi: {
          jumlah: req.body.targetJumlah,
          satuan: req.body.targetSatuan
        },
        hasilProduksi: {
          jumlah: req.body.hasilJumlah || 0,
          satuan: req.body.hasilSatuan || req.body.targetSatuan
        }
      };
      
      await Produksi.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Rencana produksi berhasil diupdate');
      res.redirect(`/produksi/${req.params.id}`);
    } catch (error) {
      console.error('Error updating produksi:', error);
      req.flash('error', 'Gagal mengupdate rencana produksi');
      res.redirect(`/produksi/${req.params.id}/edit`);
    }
  }

  // Hapus produksi
  async destroy(req, res) {
    try {
      await Produksi.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Rencana produksi berhasil dihapus');
      res.redirect('/produksi');
    } catch (error) {
      console.error('Error deleting produksi:', error);
      req.flash('error', 'Gagal menghapus rencana produksi');
      res.redirect('/produksi');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const produksi = await Produksi.find()
        .populate('formulasi', 'nama kode')
        .populate('supervisor', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'kodeProduksi', label: 'Kode Produksi' },
        { key: 'batchNumber', label: 'Batch Number' },
        { key: 'tanggalProduksi', label: 'Tanggal Produksi' },
        { key: 'kodeFormulasi', label: 'Kode Formulasi' },
        { key: 'namaFormulasi', label: 'Nama Formulasi' },
        { key: 'targetJumlah', label: 'Target Jumlah' },
        { key: 'targetSatuan', label: 'Target Satuan' },
        { key: 'hasilJumlah', label: 'Hasil Jumlah' },
        { key: 'hasilSatuan', label: 'Hasil Satuan' },
        { key: 'status', label: 'Status' },
        { key: 'kualitas', label: 'Kualitas' },
        { key: 'supervisor', label: 'Supervisor' }
      ];

      const rows = produksi.map((p) => ({
        kodeProduksi: p.kodeProduksi || '',
        batchNumber: p.batchNumber || '',
        tanggalProduksi: p.tanggalProduksi ? new Date(p.tanggalProduksi).toLocaleDateString('id-ID') : '',
        kodeFormulasi: p.formulasi && p.formulasi.kode ? p.formulasi.kode : '',
        namaFormulasi: p.formulasi && p.formulasi.nama ? p.formulasi.nama : '',
        targetJumlah: p.targetProduksi && p.targetProduksi.jumlah != null ? p.targetProduksi.jumlah : '',
        targetSatuan: p.targetProduksi && p.targetProduksi.satuan ? p.targetProduksi.satuan : '',
        hasilJumlah: p.hasilProduksi && p.hasilProduksi.jumlah != null ? p.hasilProduksi.jumlah : '',
        hasilSatuan: p.hasilProduksi && p.hasilProduksi.satuan ? p.hasilProduksi.satuan : '',
        status: p.status || '',
        kualitas: p.kualitas || '',
        supervisor: p.supervisor && p.supervisor.nama ? p.supervisor.nama : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `produksi_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting produksi CSV:', error);
      req.flash('error', 'Gagal export CSV produksi');
      return res.redirect('/produksi');
    }
  }
}

module.exports = new ProduksiController();
