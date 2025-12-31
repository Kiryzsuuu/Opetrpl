@echo off
echo ========================================
echo Sistem Manajemen Data Komoditas
echo Quick Start Script
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB connection...
mongosh --eval "db.version()" --quiet >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MongoDB tidak berjalan!
    echo [INFO] Silakan jalankan MongoDB terlebih dahulu:
    echo        - Windows: buka MongoDB Compass atau jalankan 'mongod'
    echo        - Atau gunakan MongoDB Atlas cloud
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB terhubung

echo.
echo [2/4] Checking environment variables...
if not exist .env (
    echo [ERROR] File .env tidak ditemukan!
    echo [INFO] Salin .env.example ke .env atau buat manual
    pause
    exit /b 1
)
echo [OK] File .env ditemukan

echo.
echo [3/4] Checking node_modules...
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
)
echo [OK] Dependencies terinstall

echo.
echo [4/4] Seeding database (optional)...
choice /C YN /M "Apakah Anda ingin seed database dengan data awal"
if errorlevel 2 goto :skipSeed
call node seed.js
:skipSeed

echo.
echo ========================================
echo Starting application...
echo ========================================
echo.
echo [INFO] Aplikasi akan berjalan di: http://localhost:3000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
echo Default Login:
echo - Admin: admin / admin123
echo - Peneliti: peneliti / peneliti123
echo - Petugas: petugas / petugas123
echo.
echo ========================================
echo.

call npm start
