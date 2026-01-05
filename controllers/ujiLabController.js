const UjiLab = require('../models/UjiLab');
const Formulasi = require('../models/Formulasi');
const { toCsv } = require('../utils/csv');
const { parseJsonArray } = require('../utils/json');

class UjiLabController {
  // List semua uji lab
  async index(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti' 
        ? { penanggungJawab: req.session.userId }
        : {};
      
      const ujiLab = await UjiLab.find(query)
        .populate('formulasi', 'nama kode')
        .populate('penanggungJawab', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('uji-lab/index', {
        title: 'Hasil Uji Laboratorium',
        ujiLab,
        items: ujiLab,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching uji lab:', error);
      req.flash('error', 'Gagal memuat data uji laboratorium');
      res.redirect('/dashboard');
    }
  }

  // Form tambah uji lab
  async create(req, res) {
    try {
      const formulasiId = req.query.formulasi;
      const formulasi = await Formulasi.find({ status: { $in: ['Disetujui', 'Produksi'] } });
      const selectedFormulasi = formulasiId 
        ? await Formulasi.findById(formulasiId) 
        : null;
      
      res.render('uji-lab/create', {
        title: 'Tambah Uji Laboratorium',
        formulasi,
        selectedFormulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/uji-lab');
    }
  }

  // Proses tambah uji lab
  async store(req, res) {
    try {
      const ujiLabData = {
        ...req.body,
        penanggungJawab: req.session.userId,
        parameterUji: parseJsonArray(req.body.parameterUji)
      };
      
      await UjiLab.create(ujiLabData);
      
      req.flash('success', 'Hasil uji laboratorium berhasil ditambahkan');
      res.redirect('/uji-lab');
    } catch (error) {
      console.error('Error creating uji lab:', error);
      req.flash('error', 'Gagal menambahkan hasil uji laboratorium');
      res.redirect('/uji-lab/new');
    }
  }

  // Detail uji lab
  async show(req, res) {
    try {
      const ujiLab = await UjiLab.findById(req.params.id)
        .populate('formulasi')
        .populate('penanggungJawab', 'nama email');
      
      if (!ujiLab) {
        req.flash('error', 'Data uji laboratorium tidak ditemukan');
        return res.redirect('/uji-lab');
      }
      
      res.render('uji-lab/show', {
        title: 'Detail Uji Laboratorium',
        ujiLab,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching uji lab:', error);
      req.flash('error', 'Gagal memuat detail uji laboratorium');
      res.redirect('/uji-lab');
    }
  }

  // Form edit uji lab
  async edit(req, res) {
    try {
      const ujiLab = await UjiLab.findById(req.params.id)
        .populate('formulasi');
      
      if (!ujiLab) {
        req.flash('error', 'Data uji laboratorium tidak ditemukan');
        return res.redirect('/uji-lab');
      }
      
      const formulasi = await Formulasi.find({ status: { $in: ['Disetujui', 'Produksi'] } });
      
      res.render('uji-lab/edit', {
        title: 'Edit Uji Laboratorium',
        ujiLab,
        formulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching uji lab:', error);
      req.flash('error', 'Gagal memuat data uji laboratorium');
      res.redirect('/uji-lab');
    }
  }

  // Proses update uji lab
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        parameterUji: parseJsonArray(req.body.parameterUji)
      };
      
      await UjiLab.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Hasil uji laboratorium berhasil diupdate');
      res.redirect('/uji-lab');
    } catch (error) {
      console.error('Error updating uji lab:', error);
      req.flash('error', 'Gagal mengupdate hasil uji laboratorium');
      res.redirect(`/uji-lab/${req.params.id}/edit`);
    }
  }

  // Hapus uji lab
  async destroy(req, res) {
    try {
      await UjiLab.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Hasil uji laboratorium berhasil dihapus');
      res.redirect('/uji-lab');
    } catch (error) {
      console.error('Error deleting uji lab:', error);
      req.flash('error', 'Gagal menghapus hasil uji laboratorium');
      res.redirect('/uji-lab');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti'
        ? { penanggungJawab: req.session.userId }
        : {};

      const ujiLab = await UjiLab.find(query)
        .populate('formulasi', 'nama kode')
        .populate('penanggungJawab', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'kodeUji', label: 'Kode Uji' },
        { key: 'jenisUji', label: 'Jenis Uji' },
        { key: 'tanggalUji', label: 'Tanggal Uji' },
        { key: 'laboratorium', label: 'Laboratorium' },
        { key: 'hasilUji', label: 'Hasil Uji' },
        { key: 'kodeFormulasi', label: 'Kode Formulasi' },
        { key: 'namaFormulasi', label: 'Nama Formulasi' },
        { key: 'penanggungJawab', label: 'Penanggung Jawab' }
      ];

      const rows = ujiLab.map((u) => ({
        kodeUji: u.kodeUji || '',
        jenisUji: u.jenisUji || '',
        tanggalUji: u.tanggalUji ? new Date(u.tanggalUji).toLocaleDateString('id-ID') : '',
        laboratorium: u.laboratorium || '',
        hasilUji: u.hasilUji || '',
        kodeFormulasi: u.formulasi && u.formulasi.kode ? u.formulasi.kode : '',
        namaFormulasi: u.formulasi && u.formulasi.nama ? u.formulasi.nama : '',
        penanggungJawab: u.penanggungJawab && u.penanggungJawab.nama ? u.penanggungJawab.nama : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `uji_lab_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting uji lab CSV:', error);
      req.flash('error', 'Gagal export CSV uji lab');
      return res.redirect('/uji-lab');
    }
  }
}

module.exports = new UjiLabController();
