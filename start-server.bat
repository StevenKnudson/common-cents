@echo off
title Common Cents — Local Network Server
cd /d "%~dp0"

echo.
echo  Common Cents — Local Network Server
echo  ────────────────────────────────────
echo.

:: Check that Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js is not installed.
    echo.
    echo  Please download and install it from:
    echo    https://nodejs.org
    echo.
    echo  Then double-click this file again.
    echo.
    pause
    exit /b 1
)

echo  Starting server...
echo  Keep this window open while using Common Cents.
echo.
node server.js

echo.
echo  Server stopped.
pause
