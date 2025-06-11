# Windows Port Access Troubleshooting Guide

**Resolving Node.js Port Permission Issues on Windows**

*Version 1.0 - Created June 11, 2025*

## Common Windows Port Blocking Issues

### 1. **Windows Firewall** (Most Common)
Windows Defender Firewall often blocks Node.js applications from binding to ports.

### 2. **Port Reservation** 
Windows reserves certain port ranges for system services.

### 3. **Antivirus Software**
Third-party antivirus may block Node.js network access.

### 4. **User Account Control (UAC)**
Insufficient privileges for port binding.

### 5. **Hyper-V Port Exclusions**
Hyper-V can reserve port ranges, conflicting with development servers.

---

## Diagnostic Commands

### Check Port Availability
```cmd
# Check if port is in use
netstat -ano | findstr :3333
netstat -ano | findstr :51204

# Check Windows reserved ports
netsh int ipv4 show excludedportrange protocol=tcp
```

### Check Windows Firewall Rules
```powershell
# List firewall rules for Node.js
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Node*"}

# Check if Windows Firewall is blocking
Get-NetFirewallProfile | Select-Object Name,Enabled
```

---

## Solutions (In Order of Likelihood)

### Solution 1: Configure Windows Firewall ⭐ **MOST LIKELY FIX**

#### Option A: Add Firewall Exception (Recommended)
```powershell
# Run PowerShell as Administrator, then:

# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js Development Server" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow
New-NetFirewallRule -DisplayName "Vitest UI Server" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow

# Allow npm/pnpm processes
New-NetFirewallRule -DisplayName "npm Development" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

#### Option B: Temporarily Disable Windows Firewall (Testing Only)
```powershell
# ⚠️ Only for testing - remember to re-enable!
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# To re-enable later:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### Solution 2: Check Port Reservations

#### Check Reserved Ports
```cmd
# Run Command Prompt as Administrator
netsh int ipv4 show excludedportrange protocol=tcp
netsh int ipv6 show excludedportrange protocol=tcp
```

#### Exclude Ports from Hyper-V (if needed)
```cmd
# If Hyper-V is reserving your ports:
netsh int ipv4 add excludedportrange protocol=tcp startport=3333 numberofports=1
```

### Solution 3: Antivirus Configuration

#### Common Antivirus Solutions:
- **Windows Defender**: Add Node.js to exclusions
- **McAfee/Norton**: Allow Node.js network access
- **Kaspersky**: Add to trusted applications

#### Add Node.js to Windows Defender Exclusions:
```powershell
# Run as Administrator
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm.exe" 
Add-MpPreference -ExclusionProcess "pnpm.exe"
```

### Solution 4: Run as Administrator

#### Quick Test - Run PowerShell as Administrator:
```powershell
# Right-click PowerShell -> "Run as Administrator"
cd D:\github\orpheus-engine-stagging
pnpm run test:ui:safe
```

### Solution 5: Use Alternative Ports

#### Try Different Port Ranges:
```powershell
# Try ports that are less likely to be blocked
npx vitest --ui --port 8080 --host 127.0.0.1 --open false
npx vitest --ui --port 9000 --host 127.0.0.1 --open false
npx vitest --ui --port 4000 --host 127.0.0.1 --open false
```

---

## Step-by-Step Troubleshooting

### Step 1: Quick Firewall Fix (Try This First)
```powershell
# Open PowerShell as Administrator
# Copy and paste this entire block:

Write-Host "Adding Node.js firewall exceptions..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "Node.js Dev Server (Vitest)" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Node.js Dev Server (Alt)" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Node.js Application" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow -ErrorAction SilentlyContinue

Write-Host "Adding Windows Defender exclusions..." -ForegroundColor Green
Add-MpPreference -ExclusionProcess "node.exe" -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionProcess "pnpm.exe" -ErrorAction SilentlyContinue

Write-Host "Configuration complete! Try running tests again." -ForegroundColor Cyan
```

### Step 2: Test Port Availability
```cmd
# Test if the port is now available
telnet 127.0.0.1 3333
# If it says "Could not open connection", the port is available for binding
```

### Step 3: Run Test UI
```powershell
cd D:\github\orpheus-engine-stagging
pnpm run test:ui:safe
```

---

## Automated Fix Script

Save this as `scripts/fix-windows-ports.ps1`:

```powershell
# Windows Port Access Fix Script
param(
    [int]$Port = 3333,
    [string]$NodePath = "C:\Program Files\nodejs\node.exe"
)

Write-Host "🔧 Fixing Windows port access issues..." -ForegroundColor Yellow
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor White
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green

# Add firewall rules
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Cyan
try {
    New-NetFirewallRule -DisplayName "Vitest UI Server" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -ErrorAction Stop
    Write-Host "   ✅ Added firewall rule for port $Port" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Firewall rule may already exist" -ForegroundColor Yellow
}

try {
    New-NetFirewallRule -DisplayName "Node.js Development" -Direction Inbound -Program $NodePath -Action Allow -ErrorAction Stop
    Write-Host "   ✅ Added firewall rule for Node.js" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Node.js firewall rule may already exist" -ForegroundColor Yellow
}

# Add Windows Defender exclusions
Write-Host "🛡️  Configuring Windows Defender..." -ForegroundColor Cyan
try {
    Add-MpPreference -ExclusionProcess "node.exe" -ErrorAction Stop
    Write-Host "   ✅ Added Node.js to Defender exclusions" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Node.js may already be excluded" -ForegroundColor Yellow
}

# Check port availability
Write-Host "🔍 Checking port availability..." -ForegroundColor Cyan
$portTest = Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -InformationLevel Quiet
if ($portTest) {
    Write-Host "   ⚠️  Port $Port is currently in use" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port $Port is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Configuration complete!" -ForegroundColor Green
Write-Host "   Try running: pnpm run test:ui:safe" -ForegroundColor White
Write-Host ""
```

---

## hosts File (Usually Not the Issue)

The Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`) typically doesn't affect localhost port binding, but you can check:

```cmd
# View hosts file
type C:\Windows\System32\drivers\etc\hosts

# Should contain:
# 127.0.0.1    localhost
```

---

## Quick Commands to Try Right Now

### Option 1: Add Firewall Rule (Recommended)
```powershell
# Open PowerShell as Administrator and run:
New-NetFirewallRule -DisplayName "Vitest UI" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow
```

### Option 2: Try Different Port
```bash
# In your regular terminal:
npx vitest --ui --port 8080 --host 127.0.0.1 --open false
```

### Option 3: Check What's Blocking
```cmd
# Check what's using ports:
netstat -ano | findstr :3333
netstat -ano | findstr :51204
```

The **Windows Firewall** is the most common culprit. Try the firewall rule first!
