# Hatirlat.io - Tek komutla tum proje baslatma (PowerShell)
# Kullanim: .\start-dev.ps1

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

Write-Host "==========================================" -ForegroundColor Blue
Write-Host "   Hatirlat.io Gelistirme Ortami" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Backend - yeni pencerede basla
Write-Host "`n[1/2] Backend baslatiliyor (port 8080)..." -ForegroundColor Green
$BackendProc = Start-Process -FilePath "cmd" `
  -ArgumentList "/c", "cd `"$BackendDir`" && `"C:\Users\oguzh\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd`" clean spring-boot:run" `
  -PassThru `
  -WindowStyle Normal

# Backend'in baslamasini bekle
Write-Host "Backend hazir olana kadar bekleniyor..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
      Write-Host "Backend hazir!" -ForegroundColor Green
      break
    }
  } catch {}
  Start-Sleep -Seconds 2
  $waited += 2
}

# Frontend - yeni pencerede basla
Write-Host "`n[2/2] Frontend baslatiliyor (port 3000)..." -ForegroundColor Green
$FrontendProc = Start-Process -FilePath "cmd" `
  -ArgumentList "/c", "cd `"$FrontendDir`" && npm run dev" `
  -PassThru `
  -WindowStyle Normal

Write-Host "`n==========================================" -ForegroundColor Blue
Write-Host "Servisler calistirildi:" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Swagger  : http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "  Admin    : http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "  H2 DB    : http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host "Durdurmak icin bu pencereyi kapatin veya Ctrl+C." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Blue

# Her iki proses de kapanana kadar bekle
try {
  Wait-Process -Id $BackendProc.Id, $FrontendProc.Id
} catch {
  # Temizle
  Stop-Process -Id $BackendProc.Id -ErrorAction SilentlyContinue
  Stop-Process -Id $FrontendProc.Id -ErrorAction SilentlyContinue
}
