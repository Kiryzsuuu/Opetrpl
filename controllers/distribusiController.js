const Distribusi = require('../models/Distribusi');
const Produksi = require('../models/Produksi');
const Pengemasan = require('../models/Pengemasan');
const { toCsv } = require('../utils/csv');

class DistribusiController {
  // List semua distribusi
  async index(req, res) {
    try {
      const distribusi = await Distribusi.find({})
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi', select: 'nama kode' }
        })
        .populate('petugas', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('distribusi/index', {
        title: 'Distribusi Produk',
        distribusi,
        items: distribusi,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching distribusi:', error);
      req.flash('error', 'Gagal memuat data distribusi');
      res.redirect('/dashboard');
    }
  }

  // Form tambah distribusi
  async create(req, res) {
    try {
      const produksi = await Produksi.find({ status: 'Selesai' })
        .populate('formulasi', 'nama kode');
      
      res.render('distribusi/create', {
        title: 'Tambah Distribusi',
        produksi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/distribusi');
    }
  }

  // Proses tambah distribusi
  async store(req, res) {
    try {
      const distribusiData = {
        ...req.body,
        petugas: req.session.userId,
        tujuan: {
          nama: req.body.tujuanNama,
          alamat: req.body.tujuanAlamat,
          kota: req.body.tujuanKota,
          provinsi: req.body.tujuanProvinsi,
          kodePos: req.body.tujuanKodePos,
          kontak: req.body.tujuanKontak
        },
        penerima: {
          nama: req.body.penerimaNama,
          jabatan: req.body.penerimaJabatan,
          kontak: req.body.penerimaKontak
        },
        kurir: {
          nama: req.body.kurirNama,
          noKendaraan: req.body.kurirNoKendaraan,
          kontak: req.body.kurirKontak
        }
      };
      
      await Distribusi.create(distribusiData);
      
      req.flash('success', 'Data distribusi berhasil ditambahkan');
      res.redirect('/distribusi');
    } catch (error) {
      console.error('Error creating distribusi:', error);
      req.flash('error', 'Gagal menambahkan data distribusi');
      res.redirect('/distribusi/new');
    }
  }

  // Detail distribusi
  async show(req, res) {
    try {
      const distribusi = await Distribusi.findById(req.params.id)
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi' }
        })
        .populate('pengemasan')
        .populate('petugas', 'nama email');
      
      if (!distribusi) {
        req.flash('error', 'Data distribusi tidak ditemukan');
        return res.redirect('/distribusi');
      }
      
      res.render('distribusi/show', {
        title: 'Detail Distribusi',
        distribusi,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching distribusi:', error);
      req.flash('error', 'Gagal memuat detail distribusi');
      res.redirect('/distribusi');
    }
  }

  // Form edit distribusi
  async edit(req, res) {
    try {
      const distribusi = await Distribusi.findById(req.params.id)
        .populate('produksi');
      
      if (!distribusi) {
        req.flash('error', 'Data distribusi tidak ditemukan');
        return res.redirect('/distribusi');
      }
      
      const produksi = await Produksi.find({ status: 'Selesai' })
        .populate('formulasi', 'nama kode');
      
      res.render('distribusi/edit', {
        title: 'Edit Distribusi',
        distribusi,
        produksi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching distribusi:', error);
      req.flash('error', 'Gagal memuat data distribusi');
      res.redirect('/distribusi');
    }
  }

  // Proses update distribusi
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        tujuan: {
          nama: req.body.tujuanNama,
          alamat: req.body.tujuanAlamat,
          kota: req.body.tujuanKota,
          provinsi: req.body.tujuanProvinsi,
          kodePos: req.body.tujuanKodePos,
          kontak: req.body.tujuanKontak
        },
        penerima: {
          nama: req.body.penerimaNama,
          jabatan: req.body.penerimaJabatan,
          kontak: req.body.penerimaKontak
        },
        kurir: {
          nama: req.body.kurirNama,
          noKendaraan: req.body.kurirNoKendaraan,
          kontak: req.body.kurirKontak
        }
      };
      
      await Distribusi.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Data distribusi berhasil diupdate');
      res.redirect(`/distribusi/${req.params.id}`);
    } catch (error) {
      console.error('Error updating distribusi:', error);
      req.flash('error', 'Gagal mengupdate data distribusi');
      res.redirect(`/distribusi/${req.params.id}/edit`);
    }
  }

  // Hapus distribusi
  async destroy(req, res) {
    try {
      await Distribusi.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Data distribusi berhasil dihapus');
      res.redirect('/distribusi');
    } catch (error) {
      console.error('Error deleting distribusi:', error);
      req.flash('error', 'Gagal menghapus data distribusi');
      res.redirect('/distribusi');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const distribusi = await Distribusi.find({})
        .populate({
          path: 'produksi',
          populate: { path: 'formulasi', select: 'nama kode' }
        })
        .populate('pengemasan', 'jenisPengemas jumlahKemasan')
        .populate('petugas', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'kodeDistribusi', label: 'Kode Distribusi' },
        { key: 'tanggalDistribusi', label: 'Tanggal Distribusi' },
        { key: 'kodeProduksi', label: 'Kode Produksi' },
        { key: 'batchNumber', label: 'Batch Produksi' },
        { key: 'jenisPengemas', label: 'Jenis Pengemas' },
        { key: 'tujuanNama', label: 'Tujuan Nama' },
        { key: 'tujuanKota', label: 'Tujuan Kota' },
        { key: 'jumlahProduk', label: 'Jumlah Produk' },
        { key: 'satuan', label: 'Satuan' },
        { key: 'status', label: 'Status' },
        { key: 'petugas', label: 'Petugas' }
      ];

      const rows = distribusi.map((d) => ({
        kodeDistribusi: d.kodeDistribusi || '',
        tanggalDistribusi: d.tanggalDistribusi ? new Date(d.tanggalDistribusi).toLocaleDateString('id-ID') : '',
        kodeProduksi: d.produksi && d.produksi.kodeProduksi ? d.produksi.kodeProduksi : '',
        batchNumber: d.produksi && d.produksi.batchNumber ? d.produksi.batchNumber : '',
        jenisPengemas: d.pengemasan && d.pengemasan.jenisPengemas ? d.pengemasan.jenisPengemas : '',
        tujuanNama: d.tujuan && d.tujuan.nama ? d.tujuan.nama : '',
        tujuanKota: d.tujuan && d.tujuan.kota ? d.tujuan.kota : '',
        jumlahProduk: d.jumlahProduk != null ? d.jumlahProduk : '',
        satuan: d.satuan || '',
        status: d.status || '',
        petugas: d.petugas && d.petugas.nama ? d.petugas.nama : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `distribusi_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting distribusi CSV:', error);
      req.flash('error', 'Gagal export CSV distribusi');
      return res.redirect('/distribusi');
    }
  }
}

module.exports = new DistribusiController();
