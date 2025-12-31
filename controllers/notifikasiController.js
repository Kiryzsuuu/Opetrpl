const Notifikasi = require('../models/Notifikasi');
const { toCsv } = require('../utils/csv');

class NotifikasiController {
  // List semua notifikasi user
  async index(req, res) {
    try {
      const notifikasi = await Notifikasi.find({ user: req.session.userId })
        .sort({ createdAt: -1 });
      
      const belumDibaca = await Notifikasi.countDocuments({
        user: req.session.userId,
        dibaca: false
      });
      
      res.render('notifikasi/index', {
        title: 'Notifikasi',
        notifikasi,
        items: notifikasi,
        belumDibaca,
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching notifikasi:', error);
      req.flash('error', 'Gagal memuat notifikasi');
      res.redirect('/dashboard');
    }
  }

  // Tandai notifikasi sebagai dibaca
  async markAsRead(req, res) {
    try {
      await Notifikasi.findByIdAndUpdate(req.params.id, {
        dibaca: true,
        tanggalDibaca: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false });
    }
  }

  // Tandai semua notifikasi sebagai dibaca
  async markAllAsRead(req, res) {
    try {
      await Notifikasi.updateMany(
        { user: req.session.userId, dibaca: false },
        { dibaca: true, tanggalDibaca: new Date() }
      );
      
      req.flash('success', 'Semua notifikasi ditandai sudah dibaca');
      res.redirect('/notifikasi');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      req.flash('error', 'Gagal menandai notifikasi');
      res.redirect('/notifikasi');
    }
  }

  // Hapus notifikasi
  async destroy(req, res) {
    try {
      await Notifikasi.findByIdAndDelete(req.params.id);
      
      req.flash('success', 'Notifikasi berhasil dihapus');
      res.redirect('/notifikasi');
    } catch (error) {
      console.error('Error deleting notifikasi:', error);
      req.flash('error', 'Gagal menghapus notifikasi');
      res.redirect('/notifikasi');
    }
  }

  // Utility: Create notification
  static async create(userId, judul, pesan, tipe = 'Info', kategori = 'Sistem', link = null) {
    try {
      await Notifikasi.create({
        user: userId,
        judul,
        pesan,
        tipe,
        kategori,
        link
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Export CSV
  async exportCsv(req, res) {
    try {
      const notifikasi = await Notifikasi.find({ user: req.session.userId })
        .sort({ createdAt: -1 });

      const headers = [
        { key: 'createdAt', label: 'Waktu' },
        { key: 'tipe', label: 'Tipe' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'judul', label: 'Judul' },
        { key: 'pesan', label: 'Pesan' },
        { key: 'dibaca', label: 'Dibaca' },
        { key: 'tanggalDibaca', label: 'Tanggal Dibaca' },
        { key: 'link', label: 'Link' }
      ];

      const rows = notifikasi.map((n) => ({
        createdAt: n.createdAt ? new Date(n.createdAt).toLocaleString('id-ID') : '',
        tipe: n.tipe || '',
        kategori: n.kategori || '',
        judul: n.judul || '',
        pesan: n.pesan || '',
        dibaca: n.dibaca ? 'Ya' : 'Tidak',
        tanggalDibaca: n.tanggalDibaca ? new Date(n.tanggalDibaca).toLocaleString('id-ID') : '',
        link: n.link || ''
      }));

      const csv = toCsv(headers, rows);
      const filename = `notifikasi_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      console.error('Error exporting notifikasi CSV:', error);
      req.flash('error', 'Gagal export CSV notifikasi');
      return res.redirect('/notifikasi');
    }
  }
}

module.exports = new NotifikasiController();
