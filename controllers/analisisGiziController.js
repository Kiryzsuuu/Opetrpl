const AnalisisGizi = require('../models/AnalisisGizi');
const Formulasi = require('../models/Formulasi');
const { toCsv } = require('../utils/csv');

class AnalisisGiziController {
  // List semua analisis gizi
  async index(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti' 
        ? { analis: req.session.userId }
        : {};
      
      const analisis = await AnalisisGizi.find(query)
        .populate('formulasi', 'nama kode')
        .populate('analis', 'nama')
        .sort({ createdAt: -1 });
      
      res.render('analisis-gizi/index', {
        title: 'Analisis Gizi',
        analisis,
        items: analisis,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching analisis gizi:', error);
      req.flash('error', 'Gagal memuat data analisis gizi');
      res.redirect('/dashboard');
    }
  }

  // Form tambah analisis gizi
  async create(req, res) {
    try {
      const formulasiId = req.query.formulasi;
      const formulasi = await Formulasi.find({ status: { $in: ['Disetujui', 'Produksi'] } });
      const selectedFormulasi = formulasiId 
        ? await Formulasi.findById(formulasiId) 
        : null;
      
      res.render('analisis-gizi/create', {
        title: 'Tambah Analisis Gizi',
        formulasi,
        selectedFormulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading form:', error);
      req.flash('error', 'Gagal memuat form');
      res.redirect('/analisis-gizi');
    }
  }

  // Proses tambah analisis gizi
  async store(req, res) {
    try {
      const analisisData = {
        ...req.body,
        analis: req.session.userId,
        analisis: {
          kalori: req.body.kalori || 0,
          protein: req.body.protein || 0,
          lemak: req.body.lemak || 0,
          karbohidrat: req.body.karbohidrat || 0,
          serat: req.body.serat || 0,
          gula: req.body.gula || 0,
          natrium: req.body.natrium || 0,
          vitaminA: req.body.vitaminA || 0,
          vitaminC: req.body.vitaminC || 0,
          kalsium: req.body.kalsium || 0,
          zatBesi: req.body.zatBesi || 0
        }
      };
      
      await AnalisisGizi.create(analisisData);
      
      req.flash('success', 'Analisis gizi berhasil ditambahkan');
      res.redirect('/analisis-gizi');
    } catch (error) {
      console.error('Error creating analisis gizi:', error);
      req.flash('error', 'Gagal menambahkan analisis gizi');
      res.redirect('/analisis-gizi/new');
    }
  }

  // Detail analisis gizi
  async show(req, res) {
    try {
      const analisis = await AnalisisGizi.findById(req.params.id)
        .populate('formulasi')
        .populate('analis', 'nama email');
      
      if (!analisis) {
        req.flash('error', 'Analisis gizi tidak ditemukan');
        return res.redirect('/analisis-gizi');
      }
      
      res.render('analisis-gizi/show', {
        title: 'Detail Analisis Gizi',
        analisis,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching analisis gizi:', error);
      req.flash('error', 'Gagal memuat detail analisis gizi');
      res.redirect('/analisis-gizi');
    }
  }

  // Form edit analisis gizi
  async edit(req, res) {
    try {
      const analisis = await AnalisisGizi.findById(req.params.id)
        .populate('formulasi');
      
      if (!analisis) {
        req.flash('error', 'Analisis gizi tidak ditemukan');
        return res.redirect('/analisis-gizi');
      }
      
      const formulasi = await Formulasi.find({ status: { $in: ['Disetujui', 'Produksi'] } });
      
      res.render('analisis-gizi/edit', {
        title: 'Edit Analisis Gizi',
        analisis,
        formulasi,
        user: req.session.user,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching analisis gizi:', error);
      req.flash('error', 'Gagal memuat data analisis gizi');
      res.redirect('/analisis-gizi');
    }
  }

  // Proses update analisis gizi
  async update(req, res) {
    try {
      const updateData = {
        ...req.body,
        analisis: {
          kalori: req.body.kalori || 0,
          protein: req.body.protein || 0,
          lemak: req.body.lemak || 0,
          karbohidrat: req.body.karbohidrat || 0,
          serat: req.body.serat || 0,
          gula: req.body.gula || 0,
          natrium: req.body.natrium || 0,
          vitaminA: req.body.vitaminA || 0,
          vitaminC: req.body.vitaminC || 0,
          kalsium: req.body.kalsium || 0,
          zatBesi: req.body.zatBesi || 0
        }
      };
      
      await AnalisisGizi.findByIdAndUpdate(req.params.id, updateData);
      
      req.flash('success', 'Analisis gizi berhasil diupdate');
      res.redirect('/analisis-gizi');
    } catch (error) {
      console.error('Error updating analisis gizi:', error);
      req.flash('error', 'Gagal mengupdate analisis gizi');
      res.redirect(`/analisis-gizi/${req.params.id}/edit`);
    }
  }

  // Hapus analisis gizi
  async destroy(req, res) {
    try {
      await AnalisisGizi.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Analisis gizi berhasil dihapus');
      res.redirect('/analisis-gizi');
    } catch (error) {
      console.error('Error deleting analisis gizi:', error);
      req.flash('error', 'Gagal menghapus analisis gizi');
      res.redirect('/analisis-gizi');
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const query = req.session.user.role === 'Peneliti'
        ? { analis: req.session.userId }
        : {};

      const analisis = await AnalisisGizi.find(query)
        .populate('formulasi', 'nama kode')
        .populate('analis', 'nama email')
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'tanggalAnalisis', label: 'Tanggal Analisis' },
        { key: 'kodeFormulasi', label: 'Kode Formulasi' },
        { key: 'namaFormulasi', label: 'Nama Formulasi' },
        { key: 'status', label: 'Status' },
        { key: 'kalori', label: 'Kalori' },
        { key: 'protein', label: 'Protein' },
        { key: 'lemak', label: 'Lemak' },
        { key: 'karbohidrat', label: 'Karbohidrat' },
        { key: 'serat', label: 'Serat' },
        { key: 'gula', label: 'Gula' },
        { key: 'natrium', label: 'Natrium' },
        { key: 'vitaminA', label: 'Vitamin A' },
        { key: 'vitaminC', label: 'Vitamin C' },
        { key: 'kalsium', label: 'Kalsium' },
        { key: 'zatBesi', label: 'Zat Besi' },
        { key: 'analis', label: 'Analis' }
      ];

      const rows = analisis.map((a) => ({
        tanggalAnalisis: a.tanggalAnalisis ? new Date(a.tanggalAnalisis).toLocaleDateString('id-ID') : '',
        kodeFormulasi: a.formulasi && a.formulasi.kode ? a.formulasi.kode : '',
        namaFormulasi: a.formulasi && a.formulasi.nama ? a.formulasi.nama : '',
        status: a.status || '',
        kalori: a.analisis && a.analisis.kalori != null ? a.analisis.kalori : 0,
        protein: a.analisis && a.analisis.protein != null ? a.analisis.protein : 0,
        lemak: a.analisis && a.analisis.lemak != null ? a.analisis.lemak : 0,
        karbohidrat: a.analisis && a.analisis.karbohidrat != null ? a.analisis.karbohidrat : 0,
        serat: a.analisis && a.analisis.serat != null ? a.analisis.serat : 0,
        gula: a.analisis && a.analisis.gula != null ? a.analisis.gula : 0,
        natrium: a.analisis && a.analisis.natrium != null ? a.analisis.natrium : 0,
        vitaminA: a.analisis && a.analisis.vitaminA != null ? a.analisis.vitaminA : 0,
        vitaminC: a.analisis && a.analisis.vitaminC != null ? a.analisis.vitaminC : 0,
        kalsium: a.analisis && a.analisis.kalsium != null ? a.analisis.kalsium : 0,
        zatBesi: a.analisis && a.analisis.zatBesi != null ? a.analisis.zatBesi : 0,
        analis: a.analis && a.analis.nama ? a.analis.nama : ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `analisis_gizi_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting analisis gizi CSV:', error);
      req.flash('error', 'Gagal export CSV analisis gizi');
      return res.redirect('/analisis-gizi');
    }
  }
}

module.exports = new AnalisisGiziController();
