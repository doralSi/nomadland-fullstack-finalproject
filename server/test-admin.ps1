# Test A: No token
Write-Host "`n=== Test A: GET /api/auth/admin WITHOUT token ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/admin" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody" -ForegroundColor Yellow
}

# Test B: Register and login as regular user, then try admin endpoint
Write-Host "`n=== Test B: GET /api/auth/admin WITH user token (non-admin) ===" -ForegroundColor Cyan

# Register a test user
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerBody = @{
    name = "Test User"
    email = "testuser$timestamp@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "User registered: $($registerData.user.email)" -ForegroundColor Green
    
    # Login
    $loginBody = @{
        email = $registerData.user.email
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $userToken = $loginData.token
    Write-Host "User token obtained" -ForegroundColor Green
    
    # Try admin endpoint with user token
    $headers = @{
        Authorization = "Bearer $userToken"
    }
    
    try {
        $adminResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/admin" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "Status: $($adminResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($adminResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error during registration/login: $($_.Exception.Message)" -ForegroundColor Red
}

# Test C: Try with admin token (if admin user exists)
Write-Host "`n=== Test C: GET /api/auth/admin WITH admin token ===" -ForegroundColor Cyan
Write-Host "Note: Attempting to login with admin@example.com / admin123" -ForegroundColor Gray
Write-Host "If this fails, you need to manually create an admin user in MongoDB" -ForegroundColor Gray

$adminLoginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $adminLoginData = $adminLoginResponse.Content | ConvertFrom-Json
    $adminToken = $adminLoginData.token
    Write-Host "Admin token obtained" -ForegroundColor Green
    
    # Try admin endpoint with admin token
    $adminHeaders = @{
        Authorization = "Bearer $adminToken"
    }
    
    try {
        $adminEndpointResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/admin" -Method GET -Headers $adminHeaders -UseBasicParsing -ErrorAction Stop
        Write-Host "Status: $($adminEndpointResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($adminEndpointResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Admin account not found. Creating one now..." -ForegroundColor Yellow
    
    # Register admin user
    $adminRegisterBody = @{
        name = "Admin User"
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $adminRegResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $adminRegisterBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        Write-Host "Admin user registered. You need to update their role to 'admin' in MongoDB manually." -ForegroundColor Yellow
        Write-Host "Run in MongoDB: db.users.updateOne({ email: 'admin@example.com' }, { `$set: { role: 'admin' } })" -ForegroundColor Yellow
    } catch {
        Write-Host "Could not register admin user: $($_.Exception.Message)" -ForegroundColor Red
    }
}
