const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB terhubung');
    
    // Buat default users jika belum ada
    await createDefaultUsers();
  } catch (error) {
    console.error('× Error koneksi MongoDB:', error);
    process.exit(1);
  }
};

async function createDefaultUsers() {
  const User = require('../models/User');
  
  const defaultUsers = [
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
      nama: 'Peneliti Utama',
      email: 'peneliti@sistem.com',
      role: 'Peneliti',
      noTelepon: '081234567891',
      status: 'Aktif'
    },
    {
      username: 'petugas',
      password: 'petugas123',
      nama: 'Petugas Lapangan',
      email: 'petugas@sistem.com',
      role: 'Petugas Lapangan',
      noTelepon: '081234567892',
      status: 'Aktif'
    }
  ];
  
  for (const userData of defaultUsers) {
    const exists = await User.findOne({ username: userData.username });
    if (!exists) {
      await User.create(userData);
      console.log(`✓ Default user created: ${userData.username}`);
    }
  }
}

module.exports = connectDB;
