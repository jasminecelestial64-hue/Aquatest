if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Requesting Administrator privileges..."
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "Adding Firewall Rule for Port 8081..."
try {
    New-NetFirewallRule -DisplayName "Allow Port 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
    Write-Host "Success! Firewall rule added." -ForegroundColor Green
} catch {
    Write-Error "Failed to add firewall rule: $_"
}

Write-Host "You can now verify access at http://192.168.1.110:8081"
Read-Host -Prompt "Press Enter to exit"
