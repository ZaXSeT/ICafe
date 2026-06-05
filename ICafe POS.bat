@echo off
title ICafe POS App
echo.
echo  ============================
echo     ICafe POS App Launcher
echo  ============================
echo.

:: Check if dev server is already running on port 3000
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Dev server already running.
) else (
    echo  [..] Starting dev server...
    start /min cmd /c "cd /d "%~dp0" && npm run dev"
    echo  [..] Waiting for server to start...
    timeout /t 6 /nobreak >nul
)

:: Try Microsoft Edge first, then Chrome
set "BROWSER="

where msedge >nul 2>&1
if %errorlevel%==0 (
    set "BROWSER=msedge"
    goto :launch
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
    goto :launch
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    goto :launch
)

if "%BROWSER%"=="" (
    start http://localhost:3000/pos
    goto :done
)

:launch
echo  [OK] Launching ICafe POS...
echo.
start "" "%BROWSER%" --app=http://localhost:3000/pos --window-size=1200,800 --window-position=100,50 --user-data-dir="%TEMP%\icafe-pos"

:done
echo  ICafe POS is now running!
echo  Press any key to exit this launcher...
pause >nul
