#!/bin/bash

echo "========================================"
echo "Sistem Manajemen Data Komoditas"
echo "Quick Start Script"
echo "========================================"
echo ""

# Check if MongoDB is running
echo "[1/4] Checking MongoDB connection..."
if ! mongosh --eval "db.version()" --quiet > /dev/null 2>&1; then
    echo "[ERROR] MongoDB tidak berjalan!"
    echo "[INFO] Silakan jalankan MongoDB terlebih dahulu:"
    echo "       sudo systemctl start mongod"
    echo "       atau gunakan MongoDB Atlas cloud"
    echo ""
    exit 1
fi
echo "[OK] MongoDB terhubung"

echo ""
echo "[2/4] Checking environment variables..."
if [ ! -f .env ]; then
    echo "[ERROR] File .env tidak ditemukan!"
    echo "[INFO] Salin .env.example ke .env atau buat manual"
    exit 1
fi
echo "[OK] File .env ditemukan"

echo ""
echo "[3/4] Checking node_modules..."
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
fi
echo "[OK] Dependencies terinstall"

echo ""
echo "[4/4] Seeding database (optional)..."
read -p "Apakah Anda ingin seed database dengan data awal? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node seed.js
fi

echo ""
echo "========================================"
echo "Starting application..."
echo "========================================"
echo ""
echo "[INFO] Aplikasi akan berjalan di: http://localhost:3000"
echo "[INFO] Tekan Ctrl+C untuk menghentikan server"
echo ""
echo "Default Login:"
echo "- Admin: admin / admin123"
echo "- Peneliti: peneliti / peneliti123"
echo "- Petugas: petugas / petugas123"
echo ""
echo "========================================"
echo ""

npm start
