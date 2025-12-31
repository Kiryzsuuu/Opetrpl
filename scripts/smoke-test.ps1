$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3001'

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
    throw
  }
}

Print "== 1) Check CSS =="
$css = Get-Page '/css/style.css'
Print "CSS: status=$($css.StatusCode) bytes=$($css.Content.Length) contentType=$($css.Headers['Content-Type'])"

Print "== 2) Check Login page references CSS =="
$loginPage = Get-Page '/login'
$hasCssLink = $loginPage.Content -match 'href="/css/style\.css"'
Print "Login: status=$($loginPage.StatusCode) hasCssLink=$hasCssLink"

Print "== 3) Login (superadmin) =="
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
# Preload cookies
$null = Invoke-WebRequest -Uri "$base/login" -WebSession $session -UseBasicParsing

$body = @{ email = 'maskiryz23@gmail.com'; password = 'admin123' }
try {
  $loginPost = Invoke-WebRequest -Uri "$base/login" -Method POST -Body $body -WebSession $session -MaximumRedirection 0 -UseBasicParsing
  Print "Login POST: status=$($loginPost.StatusCode)"
} catch {
  # Express typically redirects; PowerShell throws on 302 with MaxRedirection 0
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
    $status = [int]$_.Exception.Response.StatusCode
    $loc = $_.Exception.Response.Headers['Location']
    Print "Login POST: status=$status location=$loc"
  } else {
    throw
  }
}

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

Print "DONE"
