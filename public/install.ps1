# jano editor installer for Windows
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "jano editor installer" -ForegroundColor White
Write-Host ""

# check node
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if ($nodeExists) {
    $nodeVersion = (node -v).Replace("v", "").Split(".")[0]
    Write-Host "✓ Node.js v$((node -v).Replace('v', '')) found" -ForegroundColor Green

    if ([int]$nodeVersion -lt 22) {
        Write-Host "⚠ Node.js >= 22 required" -ForegroundColor Yellow
        $install = Read-Host "Install Node.js 22? (y/n)"
        if ($install -eq "y") {
            Write-Host "Downloading Node.js 22..."
            $installerUrl = "https://nodejs.org/dist/latest-v22.x/node-v22.22.0-x64.msi"
            $installerPath = "$env:TEMP\node-installer.msi"
            Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
            Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet" -Wait
            Remove-Item $installerPath
            # refresh PATH
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        } else {
            Write-Host "✗ Node.js >= 22 required" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "⚠ Node.js not found" -ForegroundColor Yellow
    $install = Read-Host "Install Node.js 22? (y/n)"
    if ($install -eq "y") {
        Write-Host "Downloading Node.js 22..."
        $installerUrl = "https://nodejs.org/dist/latest-v22.x/node-v22.22.0-x64.msi"
        $installerPath = "$env:TEMP\node-installer.msi"
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
        Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet" -Wait
        Remove-Item $installerPath
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    } else {
        Write-Host "✗ Node.js required" -ForegroundColor Red
        exit 1
    }
}

# install jano
Write-Host ""
Write-Host "Installing jano editor..."
npm install -g @jano-editor/editor@latest

# verify
$janoExists = Get-Command jano -ErrorAction SilentlyContinue
if ($janoExists) {
    Write-Host ""
    Write-Host "✓ jano installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Usage:"
    Write-Host "    jano                   Open new file"
    Write-Host "    jano file.txt          Open file"
    Write-Host "    jano plugin search     Browse plugins"
    Write-Host "    jano plugin install    Install a plugin"
    Write-Host ""
} else {
    Write-Host "✗ Installation failed. Try: npm install -g @jano-editor/editor" -ForegroundColor Red
    exit 1
}
