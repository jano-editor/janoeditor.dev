# jano editor installer for Windows
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "jano editor installer" -ForegroundColor White
Write-Host ""

$Binary = "jano-windows-x64.exe"
$DownloadUrl = "https://github.com/jano-editor/jano/releases/latest/download/$Binary"
$InstallDir = "$env:LOCALAPPDATA\jano\bin"
$InstallPath = "$InstallDir\jano.exe"

Write-Host "  Platform: windows-x64"
Write-Host ""

# Download binary
Write-Host "Downloading jano..."
try {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallPath -UseBasicParsing
} catch {
    Write-Host "✗ Download failed" -ForegroundColor Red
    Write-Host "  Please visit https://github.com/jano-editor/jano/releases"
    exit 1
}

# Verify
try {
    $version = & $InstallPath --version 2>&1
    Write-Host ""
    Write-Host "✓ jano installed to $InstallPath" -ForegroundColor Green
} catch {
    Write-Host "✗ Installation failed" -ForegroundColor Red
    Remove-Item $InstallPath -ErrorAction SilentlyContinue
    exit 1
}

# Add to PATH if not already there
$UserPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$InstallDir*") {
    [System.Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
    $env:PATH = "$env:PATH;$InstallDir"
    Write-Host ""
    Write-Host "✓ Added $InstallDir to your PATH" -ForegroundColor Green
    Write-Host "  Restart your terminal for this to take effect."
}

Write-Host ""
Write-Host "  Usage:"
Write-Host "    jano                   Open new file"
Write-Host "    jano file.txt          Open file"
Write-Host "    jano plugin search     Browse plugins"
Write-Host "    jano plugin install    Install a plugin"
Write-Host ""
