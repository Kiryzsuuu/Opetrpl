const Komoditas = require('../models/Komoditas');
const Formulasi = require('../models/Formulasi');
const Produksi = require('../models/Produksi');
const Distribusi = require('../models/Distribusi');
const AnalisisGizi = require('../models/AnalisisGizi');
const UjiLab = require('../models/UjiLab');
const ExcelJS = require('exceljs');

class LaporanController {
  // Halaman laporan
  async index(req, res) {
    try {
      // Hitung statistik untuk ditampilkan di laporan
      const stats = {
        totalKomoditas: await Komoditas.countDocuments(),
        totalFormulasi: await Formulasi.countDocuments(),
        totalProduksi: await Produksi.countDocuments(),
        totalDistribusi: await Distribusi.countDocuments()
      };

      res.render('laporan/index', {
        title: 'Laporan',
        stats,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading laporan:', error);
      req.flash('error', 'Gagal memuat halaman laporan');
      res.redirect('/dashboard');
    }
  }

  // Generate laporan
  async generate(req, res) {
    try {
      const { jenisLaporan, tanggalMulai, tanggalAkhir } = req.body;
      
      const query = {};
      if (tanggalMulai && tanggalAkhir) {
        query.createdAt = {
          $gte: new Date(tanggalMulai),
          $lte: new Date(tanggalAkhir)
        };
      }
      
      let data = {};
      
      switch (jenisLaporan) {
        case 'komoditas':
          data.komoditas = await Komoditas.find(query)
            .populate('createdBy', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'formulasi':
          data.formulasi = await Formulasi.find(query)
            .populate('peneliti', 'nama')
            .populate('komposisi.komoditas', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'produksi':
          data.produksi = await Produksi.find(query)
            .populate('formulasi', 'nama kode')
            .populate('supervisor', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'distribusi':
          data.distribusi = await Distribusi.find(query)
            .populate({
              path: 'produksi',
              populate: { path: 'formulasi', select: 'nama kode' }
            })
            .populate('petugas', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'analisis-gizi':
          data.analisisGizi = await AnalisisGizi.find(query)
            .populate('formulasi', 'nama kode')
            .populate('analis', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'uji-lab':
          data.ujiLab = await UjiLab.find(query)
            .populate('formulasi', 'nama kode')
            .populate('penanggungJawab', 'nama')
            .sort({ createdAt: -1 });
          break;
          
        case 'ringkasan':
          data.totalKomoditas = await Komoditas.countDocuments(query);
          data.totalFormulasi = await Formulasi.countDocuments(query);
          data.totalProduksi = await Produksi.countDocuments(query);
          data.totalDistribusi = await Distribusi.countDocuments(query);
          
          data.produksiPerStatus = await Produksi.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]);
          
          data.distribusiPerStatus = await Distribusi.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]);
          break;
          
        default:
          req.flash('error', 'Jenis laporan tidak valid');
          return res.redirect('/laporan');
      }
      
      res.render('laporan/hasil', {
        title: `Laporan ${jenisLaporan}`,
        jenisLaporan,
        tanggalMulai,
        tanggalAkhir,
        data,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error generating laporan:', error);
      req.flash('error', 'Gagal membuat laporan');
      res.redirect('/laporan');
    }
  }

  // Export laporan ke Excel (.xlsx)
  async exportExcel(req, res) {
    try {
      const { jenisLaporan = 'ringkasan', tanggalMulai, tanggalAkhir } = req.query;

      const query = {};
      if (tanggalMulai && tanggalAkhir) {
        const start = new Date(tanggalMulai);
        const end = new Date(tanggalAkhir);
        // include end date (treat as end-of-day)
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistem Manajemen Komoditas';
      workbook.created = new Date();

      const addSheet = (name, columns, rows) => {
        const sheet = workbook.addWorksheet(name);
        sheet.columns = columns;
        sheet.addRows(rows);
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.columns.forEach((c) => {
          c.width = Math.max(12, Math.min(40, (c.header || '').length + 8));
        });
      };

      if (jenisLaporan === 'ringkasan') {
        const sheet = workbook.addWorksheet('Ringkasan');
        sheet.columns = [
          { header: 'Metrik', key: 'metric', width: 24 },
          { header: 'Nilai', key: 'value', width: 16 }
        ];
        sheet.addRows([
          { metric: 'Total Komoditas', value: await Komoditas.countDocuments(query) },
          { metric: 'Total Formulasi', value: await Formulasi.countDocuments(query) },
          { metric: 'Total Produksi', value: await Produksi.countDocuments(query) },
          { metric: 'Total Distribusi', value: await Distribusi.countDocuments(query) },
          { metric: 'Total Analisis Gizi', value: await AnalisisGizi.countDocuments(query) },
          { metric: 'Total Uji Lab', value: await UjiLab.countDocuments(query) }
        ]);
        sheet.getRow(1).font = { bold: true };
      } else if (jenisLaporan === 'komoditas') {
        const items = await Komoditas.find(query).sort({ createdAt: -1 });
        addSheet(
          'Komoditas',
          [
            { header: 'Nama', key: 'nama' },
            { header: 'Kategori', key: 'kategori' },
            { header: 'Satuan', key: 'satuan' },
            { header: 'Stok', key: 'stok' },
            { header: 'Tanggal', key: 'tanggal' }
          ],
          items.map((k) => ({
            nama: k.nama || '',
            kategori: k.kategori || '',
            satuan: k.satuan || '',
            stok: k.stok ?? '',
            tanggal: k.createdAt ? new Date(k.createdAt).toLocaleDateString('id-ID') : ''
          }))
        );
      } else if (jenisLaporan === 'formulasi') {
        const items = await Formulasi.find(query).sort({ createdAt: -1 });
        addSheet(
          'Formulasi',
          [
            { header: 'Kode', key: 'kode' },
            { header: 'Nama', key: 'nama' },
            { header: 'Versi', key: 'versi' },
            { header: 'Status', key: 'status' },
            { header: 'Tanggal', key: 'tanggal' }
          ],
          items.map((f) => ({
            kode: f.kode || '',
            nama: f.nama || '',
            versi: f.versi || '',
            status: f.status || '',
            tanggal: f.createdAt ? new Date(f.createdAt).toLocaleDateString('id-ID') : ''
          }))
        );
      } else if (jenisLaporan === 'produksi') {
        const items = await Produksi.find(query).populate('formulasi', 'nama kode').sort({ createdAt: -1 });
        addSheet(
          'Produksi',
          [
            { header: 'Batch', key: 'batch' },
            { header: 'Formulasi', key: 'formulasi' },
            { header: 'Tanggal Produksi', key: 'tanggalProduksi' },
            { header: 'Jumlah', key: 'jumlah' },
            { header: 'Unit', key: 'unit' },
            { header: 'Status', key: 'status' }
          ],
          items.map((p) => ({
            batch: p.batch || '',
            formulasi: p.formulasi?.kode ? `${p.formulasi.kode} - ${p.formulasi.nama}` : '',
            tanggalProduksi: p.tanggalProduksi ? new Date(p.tanggalProduksi).toLocaleDateString('id-ID') : '',
            jumlah: p.jumlahProduksi ?? '',
            unit: p.unit || '',
            status: p.status || ''
          }))
        );
      } else if (jenisLaporan === 'distribusi') {
        const items = await Distribusi.find(query).sort({ createdAt: -1 });
        addSheet(
          'Distribusi',
          [
            { header: 'Tujuan', key: 'tujuan' },
            { header: 'Tanggal Distribusi', key: 'tanggalDistribusi' },
            { header: 'Jumlah', key: 'jumlah' },
            { header: 'Ekspedisi', key: 'ekspedisi' },
            { header: 'Status', key: 'status' }
          ],
          items.map((d) => ({
            tujuan: d.tujuan || '',
            tanggalDistribusi: d.tanggalDistribusi ? new Date(d.tanggalDistribusi).toLocaleDateString('id-ID') : '',
            jumlah: d.jumlah ?? '',
            ekspedisi: d.ekspedisi || '',
            status: d.status || ''
          }))
        );
      } else if (jenisLaporan === 'analisis-gizi') {
        const items = await AnalisisGizi.find(query).populate('formulasi', 'nama kode').sort({ createdAt: -1 });
        addSheet(
          'Analisis Gizi',
          [
            { header: 'Formulasi', key: 'formulasi' },
            { header: 'Kalori', key: 'kalori' },
            { header: 'Protein', key: 'protein' },
            { header: 'Lemak', key: 'lemak' },
            { header: 'Karbohidrat', key: 'karbohidrat' },
            { header: 'Tanggal', key: 'tanggal' }
          ],
          items.map((a) => ({
            formulasi: a.formulasi?.kode ? `${a.formulasi.kode} - ${a.formulasi.nama}` : '',
            kalori: a.kalori ?? '',
            protein: a.protein ?? '',
            lemak: a.lemak ?? '',
            karbohidrat: a.karbohidrat ?? '',
            tanggal: a.createdAt ? new Date(a.createdAt).toLocaleDateString('id-ID') : ''
          }))
        );
      } else if (jenisLaporan === 'uji-lab') {
        const items = await UjiLab.find(query).populate('formulasi', 'nama kode').sort({ createdAt: -1 });
        addSheet(
          'Uji Lab',
          [
            { header: 'Kode Uji', key: 'kodeUji' },
            { header: 'Formulasi', key: 'formulasi' },
            { header: 'Jenis Uji', key: 'jenisUji' },
            { header: 'Tanggal Uji', key: 'tanggalUji' },
            { header: 'Hasil', key: 'hasilUji' },
            { header: 'Laboratorium', key: 'laboratorium' }
          ],
          items.map((u) => ({
            kodeUji: u.kodeUji || '',
            formulasi: u.formulasi?.kode ? `${u.formulasi.kode} - ${u.formulasi.nama}` : '',
            jenisUji: u.jenisUji || '',
            tanggalUji: u.tanggalUji ? new Date(u.tanggalUji).toLocaleDateString('id-ID') : '',
            hasilUji: u.hasilUji || '',
            laboratorium: u.laboratorium || ''
          }))
        );
      } else {
        req.flash('error', 'Jenis laporan tidak valid');
        return res.redirect('/laporan');
      }

      const fileName = `laporan-${jenisLaporan}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting laporan excel:', error);
      req.flash('error', 'Gagal export Excel');
      res.redirect('/laporan');
    }
  }
}

module.exports = new LaporanController();
