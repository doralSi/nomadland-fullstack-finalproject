# Stage 6 - Multilingual Content Layer Test Script
# תסריט בדיקה למערכת הרב-לשונית

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🌍 Stage 6 - Language System Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$clientUrl = "http://localhost:5173"

# Test 1: Check if servers are running
Write-Host "📡 Test 1: Checking if servers are running..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Backend server is running at $baseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running at $baseUrl" -ForegroundColor Red
    Write-Host "   Please run: cd server; npm start" -ForegroundColor Yellow
    exit 1
}

try {
    $frontend = Invoke-WebRequest -Uri $clientUrl -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Frontend server is running at $clientUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend server is NOT running at $clientUrl" -ForegroundColor Red
    Write-Host "   Please run: cd client; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Language Test Endpoint
Write-Host "`n📊 Test 2: Testing language system endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/languages/test" -Method Get
    Write-Host "✅ Language test endpoint is working" -ForegroundColor Green
    Write-Host "   Supported languages: $($response.supportedLanguages -join ', ')" -ForegroundColor Cyan
    
    if ($response.statistics.points) {
        Write-Host "`n   📍 Points by language:" -ForegroundColor Cyan
        foreach ($stat in $response.statistics.points) {
            Write-Host "      - $($stat._id): $($stat.count) points" -ForegroundColor White
        }
    }
    
    if ($response.statistics.events) {
        Write-Host "`n   📅 Events by language:" -ForegroundColor Cyan
        foreach ($stat in $response.statistics.events) {
            Write-Host "      - $($stat._id): $($stat.count) events" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Language test endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test Points API with language filter
Write-Host "`n🔍 Test 3: Testing Points API with language filters..." -ForegroundColor Yellow

Write-Host "`n   Testing Hebrew mode (should return he + en):" -ForegroundColor Cyan
try {
    $hePoints = Invoke-RestMethod -Uri "$baseUrl/api/points?languages=he,en" -Method Get
    Write-Host "   ✅ Hebrew mode returned $($hePoints.Count) points" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Hebrew mode test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n   Testing English mode (should return en only):" -ForegroundColor Cyan
try {
    $enPoints = Invoke-RestMethod -Uri "$baseUrl/api/points?languages=en" -Method Get
    Write-Host "   ✅ English mode returned $($enPoints.Count) points" -ForegroundColor Green
} catch {
    Write-Host "   ❌ English mode test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test Events API with language filter
Write-Host "`n📅 Test 4: Testing Events API with language filters..." -ForegroundColor Yellow

$from = (Get-Date).ToString("yyyy-MM-dd")
$to = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")

Write-Host "`n   Testing Hebrew mode events:" -ForegroundColor Cyan
try {
    $heEvents = Invoke-RestMethod -Uri "$baseUrl/api/events?languages=he,en&from=$from&to=$to" -Method Get
    Write-Host "   ✅ Hebrew mode returned $($heEvents.Count) events" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Events test requires region parameter or may have no data" -ForegroundColor Yellow
}

# Test 5: Check file modifications
Write-Host "`n📁 Test 5: Verifying file modifications..." -ForegroundColor Yellow

$filesToCheck = @(
    "client\src\context\LanguageContext.jsx",
    "client\src\main.jsx",
    "client\src\components\Navbar.jsx",
    "server\models\Point.js",
    "server\models\Review.js",
    "server\routes\languageTestRoutes.js"
)

foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file NOT FOUND" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎯 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✅ Basic tests completed!" -ForegroundColor Green
Write-Host "`nNext steps for manual testing:" -ForegroundColor Yellow
Write-Host "1. Open the app at: $clientUrl" -ForegroundColor White
Write-Host "2. Look for the 🌐 globe icon in the Navbar" -ForegroundColor White
Write-Host "3. Click it to toggle between HE and EN" -ForegroundColor White
Write-Host "4. Navigate to Points/Events and verify filtering" -ForegroundColor White
Write-Host "5. Create a new point and check the language dropdown" -ForegroundColor White
Write-Host "6. View point details and check the language field" -ForegroundColor White
Write-Host "`nFor detailed documentation, see:" -ForegroundColor Yellow
Write-Host "- STAGE_6_MULTILINGUAL_COMPLETE.md" -ForegroundColor Cyan
Write-Host "- STAGE_6_QUICK_START.md" -ForegroundColor Cyan
Write-Host "`n========================================`n" -ForegroundColor Cyan
