Write-Host "Starting Security Tool..." -ForegroundColor Green
Write-Host ""
Write-Host "1. Please enter your IBM API Key (the LONG random string):"
$API_KEY = Read-Host -AsSecureString
$API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($API_KEY))

Write-Host ""
Write-Host "Disabling security..." -ForegroundColor Yellow

$API_URL = "https://api.au-syd.watson-orchestrate.cloud.ibm.com"
$INSTANCE_ID = "9ad1c718-6d64-4636-bbea-5eec927a0fd9"

try {
    $headers = @{
        "IAM-API_KEY"  = $API_KEY_PLAIN
        "Content-Type" = "application/json"
    }
    
    $body = @{
        "public_key"          = ""
        "client_public_key"   = ""
        "is_security_enabled" = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/instances/$INSTANCE_ID/v1/embed/secure/config" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host ""
    Write-Host "SUCCESS! Security is disabled." -ForegroundColor Green
    Write-Host "Your IBM Agent will now work without authentication!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now refresh your website and the chat should work!"
}
catch {
    Write-Host ""
    Write-Host "FAILED! Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "This probably means your API Key is wrong." -ForegroundColor Yellow
    Write-Host "Make sure you copied the ACTUAL secret key, not just the ID." -ForegroundColor Yellow
}
