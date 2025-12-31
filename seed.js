require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Komoditas = require('./models/Komoditas');
const Formulasi = require('./models/Formulasi');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Komoditas.deleteMany({});
    // await Formulasi.deleteMany({});

    // Create users
    const users = await User.create([
      {
        username: 'superadmin',
        password: 'admin123',
        nama: 'Super Administrator',
        email: 'maskiryz23@gmail.com',
        role: 'Super Admin',
        noTelepon: '081234567890',
        status: 'Aktif'
      },
      {
        username: 'admin',
        password: 'admin123',
        nama: 'Administrator',
        email: 'admin@sistem.com',
        role: 'Admin',
        noTelepon: '081234567890',
        status: 'Aktif'
      },
      {
        username: 'peneliti',
        password: 'peneliti123',
        nama: 'Dr. Budi Santoso',
        email: 'peneliti@sistem.com',
        role: 'Peneliti',
        noTelepon: '081234567891',
        status: 'Aktif'
      },
      {
        username: 'petugas',
        password: 'petugas123',
        nama: 'Andi Wijaya',
        email: 'petugas@sistem.com',
        role: 'Petugas Lapangan',
        noTelepon: '081234567892',
        status: 'Aktif'
      }
    ]);
    console.log('✓ Users created');

    // Create sample komoditas
    const komoditas = await Komoditas.create([
      {
        kode: 'KMD001',
        nama: 'Beras Organik',
        kategori: 'Biji-bijian',
        deskripsi: 'Beras organik berkualitas tinggi',
        satuan: 'kg',
        hargaPerSatuan: 15000,
        stok: 500,
        supplier: 'PT. Pangan Sehat',
        status: 'Tersedia',
        createdBy: users[0]._id
      },
      {
        kode: 'KMD002',
        nama: 'Jagung Manis',
        kategori: 'Sayuran',
        deskripsi: 'Jagung manis segar',
        satuan: 'kg',
        hargaPerSatuan: 8000,
        stok: 200,
        supplier: 'CV. Sayur Segar',
        status: 'Tersedia',
        createdBy: users[0]._id
      },
      {
        kode: 'KMD003',
        nama: 'Kedelai Hitam',
        kategori: 'Protein',
        deskripsi: 'Kedelai hitam organik',
        satuan: 'kg',
        hargaPerSatuan: 12000,
        stok: 150,
        supplier: 'PT. Pangan Sehat',
        status: 'Tersedia',
        createdBy: users[0]._id
      },
      {
        kode: 'KMD004',
        nama: 'Wortel',
        kategori: 'Sayuran',
        deskripsi: 'Wortel segar',
        satuan: 'kg',
        hargaPerSatuan: 10000,
        stok: 100,
        supplier: 'CV. Sayur Segar',
        status: 'Tersedia',
        createdBy: users[0]._id
      },
      {
        kode: 'KMD005',
        nama: 'Pisang Ambon',
        kategori: 'Buah',
        deskripsi: 'Pisang ambon matang',
        satuan: 'kg',
        hargaPerSatuan: 15000,
        stok: 80,
        supplier: 'Toko Buah Segar',
        status: 'Tersedia',
        createdBy: users[0]._id
      }
    ]);
    console.log('✓ Komoditas created');

    // Create sample formulasi
    await Formulasi.create([
      {
        kode: 'FORM001',
        nama: 'Bubur Bayi Organik',
        deskripsi: 'Bubur bayi dengan bahan organik',
        kategoriProduk: 'Makanan Bayi',
        komposisi: [
          {
            komoditas: komoditas[0]._id,
            jumlah: 50,
            satuan: 'gram',
            persentase: 50
          },
          {
            komoditas: komoditas[3]._id,
            jumlah: 30,
            satuan: 'gram',
            persentase: 30
          },
          {
            komoditas: komoditas[4]._id,
            jumlah: 20,
            satuan: 'gram',
            persentase: 20
          }
        ],
        caraProduksi: '1. Cuci beras dan wortel\n2. Kukus hingga matang\n3. Haluskan dengan blender\n4. Campurkan dengan pisang yang dihaluskan\n5. Kemas dalam wadah steril',
        estimasiWaktuProduksi: '2 jam',
        targetHasil: {
          jumlah: 100,
          satuan: 'gram'
        },
        status: 'Disetujui',
        peneliti: users[1]._id,
        tanggalDisetujui: new Date()
      },
      {
        kode: 'FORM002',
        nama: 'Snack Jagung Keju',
        deskripsi: 'Snack dari jagung dengan rasa keju',
        kategoriProduk: 'Snack',
        komposisi: [
          {
            komoditas: komoditas[1]._id,
            jumlah: 70,
            satuan: 'gram',
            persentase: 70
          },
          {
            komoditas: komoditas[2]._id,
            jumlah: 30,
            satuan: 'gram',
            persentase: 30
          }
        ],
        caraProduksi: '1. Giling jagung dan kedelai\n2. Campurkan dengan bumbu keju\n3. Bentuk dan goreng\n4. Kemas dalam kemasan kedap udara',
        estimasiWaktuProduksi: '3 jam',
        targetHasil: {
          jumlah: 100,
          satuan: 'gram'
        },
        status: 'Disetujui',
        peneliti: users[1]._id,
        tanggalDisetujui: new Date()
      }
    ]);
    console.log('✓ Formulasi created');

    console.log('\n✓ Seed data berhasil dibuat!');
    console.log('\nDefault Login Credentials:');
    console.log('Super Admin: superadmin / admin123 (maskiryz23@gmail.com)');
    console.log('Admin: admin / admin123');
    console.log('Peneliti: peneliti / peneliti123');
    console.log('Petugas: petugas / petugas123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
