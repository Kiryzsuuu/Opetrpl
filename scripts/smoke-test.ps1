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

  # Produksi
  $produksiNew = Get-PageNoThrow '/produksi/new' $session
  if ($produksiNew.StatusCode -eq 200) {
    $formulasiId = Extract-FirstSelectValue $produksiNew.Content 'formulasi'
    if ($formulasiId) {
      for ($i = 1; $i -le $count; $i++) {
        $today = Get-Date
        $kode = "SMK-PRD-$($today.ToString('yyyyMMdd'))-$i"
        $batch = "BATCH-SMK-$i"
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
          tanggalProduksi = $today.ToString('yyyy-MM-dd')
          formulasi = $formulasiId
          targetJumlah = '10'
          targetSatuan = 'kg'
          hasilJumlah = '9.8'
          hasilSatuan = 'kg'
          status = 'Perencanaan'
          kualitas = 'A'
          peralatan = ($peralatan | ConvertTo-Json -Compress)
          prosesProduksi = ($proses | ConvertTo-Json -Compress)
          catatan = 'smoke-test'
        }

        $r = Post-PageNoThrow '/produksi' $body $session
        Print ("POST /produksi sample#{0} => {1}" -f $i, $r.StatusCode)
      }
    } else {
      Print "SKIP Produksi: tidak ada opsi formulasi di /produksi/new"
    }
  } else {
    Print ("SKIP Produksi: GET /produksi/new => {0}" -f $produksiNew.StatusCode)
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
  if ($pkNew.StatusCode -eq 200) {
    $produksiId = Extract-FirstSelectValue $pkNew.Content 'produksi'
    if ($produksiId) {
      for ($i = 1; $i -le $count; $i++) {
        $today = Get-Date
        $sert = @(
          @{ jenisSertifikat = 'BPOM'; nomorSertifikat = "MD-000$i"; tanggalBerlaku = $today.ToString('yyyy-MM-dd') }
        )
        $audit = @(
          @{ tanggal = $today.ToString('yyyy-MM-dd'); aktivitas = 'QC'; pic = 'admin'; hasil = 'OK' }
        )
        $body = @{
          produksi = $produksiId
          tanggalKemas = $today.ToString('yyyy-MM-dd')
          jenisPengemas = 'Pouch'
          jumlahKemasan = '10'
          ukuranKemasan = '250g'
          beratPerKemasan = '0.25'
          nomorBatch = "PK-SMK-$i"
          tanggalKadaluarsa = $today.AddMonths(6).ToString('yyyy-MM-dd')
          status = 'Pending'
          standarKeamanan = 'HACCP'
          labelNutrisi = 'true'
          labelHalal = 'true'
          sertifikasiKeamanan = ($sert | ConvertTo-Json -Compress)
          auditTrail = ($audit | ConvertTo-Json -Compress)
          catatan = 'smoke-test'
        }
        $r = Post-PageNoThrow '/pengemasan' $body $session
        Print ("POST /pengemasan sample#{0} => {1}" -f $i, $r.StatusCode)
      }
    } else {
      Print "SKIP Pengemasan: tidak ada opsi produksi di /pengemasan/new (butuh Produksi status Selesai)"
    }
  } else {
    Print ("SKIP Pengemasan: GET /pengemasan/new => {0}" -f $pkNew.StatusCode)
  }
} else {
  Print "== 7) Skip create-form smoke test (set SMOKE_MUTATE=1 to enable) =="
}

Print "DONE"
