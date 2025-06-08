@echo off
REM Windows wrapper for setup-electron functionality when running in MINGW64/Git Bash
echo Setting up Electron environment in Windows...

REM First try WSL since you have Node.js there
where wsl >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo Found WSL, using it to run the script with Node.js v20.19.0
  wsl bash -c "source ~/.nvm/nvm.sh && nvm use 20.19.0 && node /mnt/d/github/orpheus-engine/scripts/setup-electron-win.js"
  if %ERRORLEVEL% equ 0 (
    goto :done
  ) else (
    echo Trying alternative WSL Node.js path...
    wsl node /mnt/d/github/orpheus-engine/scripts/setup-electron-win.js
    if %ERRORLEVEL% equ 0 (
      goto :done
    )
  )
)

echo Trying Node.js in Windows PATH
node scripts\setup-electron-win.js

if %ERRORLEVEL% neq 0 (
  echo Node.js command failed. Trying with explicit path...
  
  REM Try common Node.js installation locations
  if exist "C:\Program Files\nodejs\node.exe" (
    echo Using Node.js from Program Files
    "C:\Program Files\nodejs\node.exe" scripts\setup-electron-win.js
    goto :done
  )
  
  if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo Using Node.js from Program Files (x86)
    "C:\Program Files (x86)\nodejs\node.exe" scripts\setup-electron-win.js
    goto :done
  )
  
  if exist "%APPDATA%\nvm\v20.19.0\node.exe" (
    echo Using Node.js from NVM
    "%APPDATA%\nvm\v20.19.0\node.exe" scripts\setup-electron-win.js
    goto :done
  )
  
  if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
    echo Using Node.js from LocalAppData
    "%LOCALAPPDATA%\Programs\node\node.exe" scripts\setup-electron-win.js
    goto :done
  )
  
  echo Could not find Node.js executable. Please ensure Node.js is installed.
  exit /b 1
)

:done
echo Electron setup completed.
