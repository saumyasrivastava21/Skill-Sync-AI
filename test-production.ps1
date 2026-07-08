Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SkillSync AI Production Test Started" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n[1] Checking Docker containers..." -ForegroundColor Yellow
docker compose ps

Write-Host "`n[2] Checking backend health..." -ForegroundColor Yellow
try {
    Invoke-RestMethod http://127.0.0.1:8000/api/v1/health/
    Write-Host "Backend health check passed." -ForegroundColor Green
} catch {
    Write-Host "Backend health check failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n[3] Checking frontend home page..." -ForegroundColor Yellow
try {
    Invoke-WebRequest http://127.0.0.1:3000 -UseBasicParsing | Out-Null
    Write-Host "Frontend is reachable." -ForegroundColor Green
} catch {
    Write-Host "Frontend check failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n[4] Checking backend logs..." -ForegroundColor Yellow
docker compose logs backend --tail 30

Write-Host "`n[5] Checking frontend logs..." -ForegroundColor Yellow
docker compose logs frontend --tail 30

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "SkillSync AI local production test completed." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
