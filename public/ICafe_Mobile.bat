@echo off
title ICafe Mobile App
echo.
echo  ============================
echo    ICafe Mobile App Launcher
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

:: Try Microsoft Edge first (most common on Windows), then Chrome
set "BROWSER="

:: Check Edge
where msedge >nul 2>&1
if %errorlevel%==0 (
    set "BROWSER=msedge"
    goto :launch
)

:: Check Chrome (standard paths)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
    goto :launch
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    goto :launch
)

:: Fallback: just open in default browser
if "%BROWSER%"=="" (
    echo  [!] Edge/Chrome not found. Opening in default browser...
    start http://localhost:3000/app
    goto :done
)

:launch
echo  [OK] Launching ICafe Mobile App...
echo.
start "" "%BROWSER%" --app=http://localhost:3000/app --window-size=420,800 --window-position=500,50 --user-data-dir="%TEMP%\icafe-app"

:done
echo  ICafe Mobile App is now running!
echo  Press any key to exit this launcher...
pause >nul
