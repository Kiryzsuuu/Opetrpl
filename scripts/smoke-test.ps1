$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3001'
if ($env:SMOKE_BASE) {
  $base = $env:SMOKE_BASE
}

function Print($msg) {
  Write-Host $msg
}

function Get-Page([string]$path, $session = $null) {
  $uri = "$base$path"
  if ($null -eq $session) {
    return Invoke-WebRequest -Uri $uri -Method GET -UseBasicParsing
  }
  return Invoke-WebRequest -Uri $uri -Method GET -WebSession $session -UseBasicParsing
}

function Get-PageNoThrow([string]$path, $session = $null) {
  $uri = "$base$path"
  try {
    if ($null -eq $session) {
      return Invoke-WebRequest -Uri $uri -Method GET -UseBasicParsing
    }
    return Invoke-WebRequest -Uri $uri -Method GET -WebSession $session -UseBasicParsing
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
      return [pscustomobject]@{ StatusCode = $status; Content = '' ; Headers = @{} }
    }
    return [pscustomobject]@{ StatusCode = 0; Content = '' ; Headers = @{}; Error = $_.Exception.Message }
  }
}

function Post-PageNoThrow([string]$path, $body, $session) {
  $uri = "$base$path"
  try {
    return Invoke-WebRequest -Uri $uri -Method POST -Body $body -WebSession $session -UseBasicParsing
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
      return [pscustomobject]@{ StatusCode = $status; Content = '' ; Headers = @{} }
    }
    return [pscustomobject]@{ StatusCode = 0; Content = '' ; Headers = @{}; Error = $_.Exception.Message }
  }
}

function Extract-FirstSelectValue([string]$html, [string]$selectName) {
  if (-not $html) { return $null }
  $escapedName = [regex]::Escape($selectName)
  $pattern = "<select[^>]*name=`"$escapedName`"[^>]*>[\s\S]*?</select>"
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $m.Success) { return $null }

  $selectHtml = $m.Value
  $optMatches = [regex]::Matches($selectHtml, '<option\s+value="([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  foreach ($om in $optMatches) {
    $v = $om.Groups[1].Value
    if ($v -and $v.Trim() -ne '') { return $v }
  }
  return $null
}

function Extract-SelectValues([string]$html, [string]$attrName, [string]$attrValue, [int]$max = 0) {
  if (-not $html) { return @() }
  $escapedName = [regex]::Escape($attrName)
  $escapedValue = [regex]::Escape($attrValue)
  $pattern = "<select[^>]*$escapedName=`"$escapedValue`"[^>]*>[\s\S]*?</select>"
  $m = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $m.Success) { return @() }

  $selectHtml = $m.Value
  $vals = @()
  $optMatches = [regex]::Matches($selectHtml, '<option\s+value="([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  foreach ($om in $optMatches) {
    $v = $om.Groups[1].Value
    if ($v -and $v.Trim() -ne '') {
      $vals += $v
      if ($max -gt 0 -and $vals.Count -ge $max) { break }
    }
  }
  return $vals
}

function Extract-SelectValuesByName([string]$html, [string]$selectName, [int]$max = 0) {
  return Extract-SelectValues $html 'name' $selectName $max
}

function Extract-SelectValuesById([string]$html, [string]$selectId, [int]$max = 0) {
  return Extract-SelectValues $html 'id' $selectId $max
}

Print ("SMOKE_BASE={0}" -f $base)

Print "== 1) Check CSS =="
$css = Get-PageNoThrow '/css/style.css'
Print "CSS: status=$($css.StatusCode) bytes=$($css.Content.Length) contentType=$($css.Headers['Content-Type']) error=$($css.Error)"

Print "== 2) Check Login page references CSS =="
$loginPage = Get-PageNoThrow '/login'
$hasCssLink = $loginPage.Content -match 'href="/css/style\.css"'
Print "Login: status=$($loginPage.StatusCode) hasCssLink=$hasCssLink error=$($loginPage.Error)"

Print "== 3) Login (superadmin) =="
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
# Preload cookies
$null = Get-PageNoThrow '/login' $session

$email = $env:SMOKE_EMAIL
$password = $env:SMOKE_PASSWORD
if (-not $email) { $email = 'maskiryz23@gmail.com' }
if (-not $password) { $password = 'admin123' }

$body = @{ email = $email; password = $password }
$loginPost = Post-PageNoThrow '/login' $body $session
Print "Login POST: status=$($loginPost.StatusCode) error=$($loginPost.Error)"

# Follow dashboard
$dash = Get-PageNoThrow '/dashboard' $session
Print "Dashboard: status=$($dash.StatusCode)"

Print "== 4) Smoke test module pages (should be 200 + contain CSS link) =="
$paths = @(
  '/komoditas',
  '/formulasi',
  '/analisis-gizi',
  '/uji-lab',
  '/produksi',
  '/pengemasan',
  '/distribusi',
  '/laporan',
  '/notifikasi'
)

foreach ($p in $paths) {
  $r = Get-PageNoThrow $p $session
  $hasCss = $r.Content -match '/css/style\.css'
  $hasBootstrap = $r.Content -match 'bootstrap'
  Print ("GET {0} => {1} cssLink:{2} bootstrapToken:{3}" -f $p, $r.StatusCode, $hasCss, $hasBootstrap)
}

Print "== 5) Check Chart.js markers on Analisis Gizi index =="
$ag = Get-PageNoThrow '/analisis-gizi' $session
$hasChart = $ag.Content -match 'chart\.umd\.min\.js'
$hasCanvas = $ag.Content -match 'id="giziChart"'
Print "Analisis Gizi: status=$($ag.StatusCode) chartJs:$hasChart canvas:$hasCanvas"

Print "== 6) Smoke test CSV exports (should be 200) =="
$csvPaths = @(
  '/formulasi/export/csv',
  '/analisis-gizi/export/csv',
  '/uji-lab/export/csv',
  '/produksi/export/csv',
  '/pengemasan/export/csv',
  '/distribusi/export/csv',
  '/notifikasi/export/csv'
)

foreach ($p in $csvPaths) {
  $r = Get-PageNoThrow $p $session
  $preview = ''
  if ($r.Content) {
    $lines = ($r.Content -replace "`r", '') -split "`n"
    $preview = ($lines | Select-Object -First 2) -join ' | '
  }
  Print ("CSV {0} => {1} preview: {2}" -f $p, $r.StatusCode, $preview)
}

$doMutate = $false
if ($env:SMOKE_MUTATE) {
  $v = "$($env:SMOKE_MUTATE)".ToLowerInvariant()
  $doMutate = ($v -eq '1' -or $v -eq 'true' -or $v -eq 'yes')
}

if ($doMutate) {
  Print "== 7) Smoke test create forms (MUTATES DB) =="
  $count = 5
  if ($env:SMOKE_COUNT) {
    try { $count = [int]$env:SMOKE_COUNT } catch { $count = 5 }
  }

  $runId = (Get-Date).ToString('yyyyMMddHHmmss')

  # Komoditas
  $komNew = Get-PageNoThrow '/komoditas/new' $session
  if ($komNew.StatusCode -eq 200) {
    for ($i = 1; $i -le $count; $i++) {
      $today = Get-Date
      $kode = "SMK-KMD-$runId-$i"
      $nama = "Komoditas Sample $i"
      $kategori = @('Biji-bijian', 'Sayuran', 'Buah', 'Protein', 'Lainnya')[($i - 1) % 5]
      $body = @{
        kode = $kode
        nama = $nama
        kategori = $kategori
        satuan = 'kg'
        hargaPerSatuan = (10000 * $i)
        stok = (10 * $i)
        supplier = 'Supplier Demo'
        status = 'Tersedia'
        deskripsi = 'seed sample'
        tanggalMasuk = $today.ToString('yyyy-MM-dd')
      }
      $r = Post-PageNoThrow '/komoditas' $body $session
      Print ("POST /komoditas sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print ("SKIP Komoditas: GET /komoditas/new => {0}" -f $komNew.StatusCode)
  }

  # Formulasi
  $frmNew = Get-PageNoThrow '/formulasi/new' $session
  $komoditasIds = Extract-SelectValuesById $frmNew.Content 'komoditasId'
  if ($frmNew.StatusCode -eq 200 -and $komoditasIds.Count -gt 0) {
    for ($i = 1; $i -le $count; $i++) {
      $kode = "SMK-FRM-$runId-$i"
      $nama = "Formulasi Sample $i"
      $komA = $komoditasIds[($i - 1) % $komoditasIds.Count]
      $komB = $komoditasIds[($i) % $komoditasIds.Count]
      $komposisi = @(
        @{ komoditas = $komA; jumlah = (1 + $i); satuan = 'kg' },
        @{ komoditas = $komB; jumlah = (0.5 + ($i * 0.1)); satuan = 'kg' }
      )

      $body = @{
        kode = $kode
        nama = $nama
        kategoriProduk = 'Produk Demo'
        estimasiWaktuProduksi = '2 jam'
        deskripsi = 'seed sample'
        caraProduksi = 'Campur bahan, aduk rata, kemudian proses sesuai SOP.'
        'targetHasil[jumlah]' = '10'
        'targetHasil[satuan]' = 'kg'
        status = 'Disetujui'
        komposisi = ($komposisi | ConvertTo-Json -Compress)
      }
      $r = Post-PageNoThrow '/formulasi' $body $session
      Print ("POST /formulasi sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print "SKIP Formulasi: tidak ada komoditas tersedia di /formulasi/new"
  }

  # Analisis Gizi
  $agNew = Get-PageNoThrow '/analisis-gizi/new' $session
  $formulasiIds = Extract-SelectValuesByName $agNew.Content 'formulasi'
  if ($agNew.StatusCode -eq 200 -and $formulasiIds.Count -gt 0) {
    for ($i = 1; $i -le $count; $i++) {
      $today = Get-Date
      $fid = $formulasiIds[($i - 1) % $formulasiIds.Count]
      $body = @{
        formulasi = $fid
        tanggalAnalisis = $today.AddDays(-$i).ToString('yyyy-MM-dd')
        kalori = (120 + ($i * 10))
        protein = (5 + $i)
        lemak = (2 + ($i * 0.5))
        karbohidrat = (20 + ($i * 2))
        serat = (2 + ($i * 0.2))
        gula = (3 + ($i * 0.3))
        natrium = (100 + ($i * 15))
        vitaminA = (10 + ($i * 2))
        vitaminC = (8 + ($i * 1))
        kalsium = (50 + ($i * 5))
        zatBesi = (4 + ($i * 0.4))
        metodePengujian = 'Perhitungan dan uji lab standar'
        status = 'Selesai'
        catatan = 'seed sample'
        kesimpulan = 'Sesuai target'
        rekomendasi = 'Lanjut ke tahap berikutnya'
      }
      $r = Post-PageNoThrow '/analisis-gizi' $body $session
      Print ("POST /analisis-gizi sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print "SKIP Analisis Gizi: tidak ada formulasi tersedia di /analisis-gizi/new"
  }

  # Produksi (status Selesai agar bisa dipakai Pengemasan/Distribusi)
  $produksiNew = Get-PageNoThrow '/produksi/new' $session
  $formulasiForProduksi = Extract-SelectValuesByName $produksiNew.Content 'formulasi'
  if ($produksiNew.StatusCode -eq 200 -and $formulasiForProduksi.Count -gt 0) {
    for ($i = 1; $i -le $count; $i++) {
      $today = Get-Date
      $fid = $formulasiForProduksi[($i - 1) % $formulasiForProduksi.Count]
      $kode = "SMK-PRD-$runId-$i"
      $batch = "BATCH-SMK-$runId-$i"
      $peralatan = @(
        @{ namaAlat = 'Mixer'; status = 'OK' },
        @{ namaAlat = 'Timbangan Digital'; status = 'Kalibrasi' }
      )
      $start = $today.AddMinutes($i)
      $proses = @(
        @{ tahap = 'Persiapan'; waktuMulai = $start.ToString('o'); waktuSelesai = $start.AddMinutes(10).ToString('o'); pic = 'Andi'; catatan = 'Cek alat' },
        @{ tahap = 'Mixing'; waktuMulai = $start.AddMinutes(10).ToString('o'); waktuSelesai = $start.AddMinutes(40).ToString('o'); pic = 'Budi'; catatan = 'Kecepatan sedang' }
      )

      $body = @{
        kodeProduksi = $kode
        batchNumber = $batch
        tanggalProduksi = $today.AddDays(-$i).ToString('yyyy-MM-dd')
        formulasi = $fid
        targetJumlah = '10'
        targetSatuan = 'kg'
        hasilJumlah = '9.8'
        hasilSatuan = 'kg'
        status = 'Selesai'
        kualitas = 'A'
        peralatan = ($peralatan | ConvertTo-Json -Compress)
        prosesProduksi = ($proses | ConvertTo-Json -Compress)
        catatan = 'seed sample'
      }

      $r = Post-PageNoThrow '/produksi' $body $session
      Print ("POST /produksi sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print "SKIP Produksi: tidak ada formulasi Disetujui di /produksi/new"
  }

  # Uji Lab
  $ujiNew = Get-PageNoThrow '/uji-lab/new' $session
  if ($ujiNew.StatusCode -eq 200) {
    $formulasiId = Extract-FirstSelectValue $ujiNew.Content 'formulasi'
    if ($formulasiId) {
      for ($i = 1; $i -le $count; $i++) {
        $today = Get-Date
        $kode = "SMK-UJI-$($today.ToString('yyyyMMdd'))-$i"
        $params = @(
          @{ parameter = 'TPC'; nilai = "$i"; satuan = 'CFU'; status = 'Lulus' },
          @{ parameter = 'pH'; nilai = '6.5'; satuan = 'pH'; status = 'Lulus' }
        )
        $body = @{
          formulasi = $formulasiId
          kodeUji = $kode
          jenisUji = 'Mikrobiologi'
          tanggalUji = $today.ToString('yyyy-MM-dd')
          laboratorium = 'Lab Internal'
          hasilUji = 'Pending'
          parameterUji = ($params | ConvertTo-Json -Compress)
          catatan = 'smoke-test'
          rekomendasi = 'lanjut'
        }
        $r = Post-PageNoThrow '/uji-lab' $body $session
        Print ("POST /uji-lab sample#{0} => {1}" -f $i, $r.StatusCode)
      }
    } else {
      Print "SKIP Uji Lab: tidak ada opsi formulasi di /uji-lab/new"
    }
  } else {
    Print ("SKIP Uji Lab: GET /uji-lab/new => {0}" -f $ujiNew.StatusCode)
  }

  # Pengemasan
  $pkNew = Get-PageNoThrow '/pengemasan/new' $session
  $produksiIdsForPack = Extract-SelectValuesByName $pkNew.Content 'produksi'
  if ($pkNew.StatusCode -eq 200 -and $produksiIdsForPack.Count -gt 0) {
    for ($i = 1; $i -le $count; $i++) {
      $today = Get-Date
      $pid = $produksiIdsForPack[($i - 1) % $produksiIdsForPack.Count]
      $sert = @(
        @{ jenisSertifikat = 'BPOM'; nomorSertifikat = "MD-$runId-$i"; tanggalBerlaku = $today.ToString('yyyy-MM-dd') }
      )
      $audit = @(
        @{ tanggal = $today.ToString('yyyy-MM-dd'); aktivitas = 'QC'; hasil = 'OK' }
      )
      $body = @{
        produksi = $pid
        tanggalKemas = $today.ToString('yyyy-MM-dd')
        jenisPengemas = 'Pouch'
        jumlahKemasan = '10'
        ukuranKemasan = '250g'
        beratPerKemasan = '0.25'
        nomorBatch = "PK-SMK-$runId-$i"
        tanggalKadaluarsa = $today.AddMonths(6).ToString('yyyy-MM-dd')
        status = 'Selesai'
        standarKeamanan = 'HACCP'
        labelNutrisi = 'true'
        labelHalal = 'true'
        sertifikasiKeamanan = ($sert | ConvertTo-Json -Compress)
        auditTrail = ($audit | ConvertTo-Json -Compress)
        catatan = 'seed sample'
      }
      $r = Post-PageNoThrow '/pengemasan' $body $session
      Print ("POST /pengemasan sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print "SKIP Pengemasan: tidak ada produksi status Selesai di /pengemasan/new"
  }

  # Distribusi
  $distNew = Get-PageNoThrow '/distribusi/new' $session
  $produksiIdsForDist = Extract-SelectValuesByName $distNew.Content 'produksi'
  if ($distNew.StatusCode -eq 200 -and $produksiIdsForDist.Count -gt 0) {
    for ($i = 1; $i -le $count; $i++) {
      $today = Get-Date
      $pid = $produksiIdsForDist[($i - 1) % $produksiIdsForDist.Count]
      $kode = "SMK-DST-$runId-$i"
      $body = @{
        kodeDistribusi = $kode
        produksi = $pid
        tanggalDistribusi = $today.ToString('yyyy-MM-dd')
        jumlahProduk = '10'
        satuan = 'pcs'
        tujuanNama = 'Puskesmas Contoh'
        tujuanKontak = '08123456789'
        tujuanAlamat = 'Jl. Contoh No. 1'
        tujuanKota = 'Kota Demo'
        tujuanProvinsi = 'Jawa Barat'
        tujuanKodePos = '40111'
        penerimaNama = 'Ibu Sari'
        penerimaJabatan = 'Petugas'
        penerimaKontak = '08120000000'
        kurirNama = 'Kurir Demo'
        kurirNoKendaraan = 'D 1234 ABC'
        kurirKontak = '08129999999'
        estimasiSampai = $today.AddDays(1).ToString('yyyy-MM-dd')
        tanggalSampai = ''
        status = 'Persiapan'
        catatan = 'seed sample'
      }
      $r = Post-PageNoThrow '/distribusi' $body $session
      Print ("POST /distribusi sample#{0} => {1}" -f $i, $r.StatusCode)
    }
  } else {
    Print "SKIP Distribusi: tidak ada produksi status Selesai di /distribusi/new"
  }

  # Laporan (5 contoh generate)
  $reportKinds = @('ringkasan','komoditas','formulasi','produksi','distribusi')
  $idx = 1
  foreach ($k in $reportKinds) {
    $body = @{
      jenisLaporan = $k
      tanggalMulai = ''
      tanggalAkhir = ''
    }
    $r = Post-PageNoThrow '/laporan/generate' $body $session
    Print ("POST /laporan/generate ({0}) => {1}" -f $k, $r.StatusCode)
    $idx++
  }
} else {
  Print "== 7) Skip create-form smoke test (set SMOKE_MUTATE=1 to enable) =="
}

Print "DONE"
