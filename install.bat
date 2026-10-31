@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

:: 1. Imposta la cartella sorgente come la cartella da cui viene lanciato questo bat
cd /d "%~dp0"
set "PLUGIN_DIR=%~dp0"
if "%PLUGIN_DIR:~-1%"=="\" set "PLUGIN_DIR=%PLUGIN_DIR:~0,-1%"

echo ==============================================================================
echo   INSTALL / UPDATE SUPERSET PLUGIN: KPI Comparison
echo   Cartella sorgente: "%PLUGIN_DIR%"
echo ==============================================================================
echo.

:: 2. Run the PowerShell script, passing the source folder explicitly
powershell -NoProfile -ExecutionPolicy Bypass -File "%PLUGIN_DIR%\install-plugin.ps1" -PluginPath "%PLUGIN_DIR%" -SkipBuild %*

set "RC=%ERRORLEVEL%"
if %RC% neq 0 (
    echo.
    echo [ERROR] The KPI Comparison installation failed ^(Code: %RC%^).
) else (
    echo.
    echo [OK] KPI Comparison aggiornato e registrato con successo
)

echo.
rem With NO_PAUSE=1 it does not wait for a key press (script use); the exit code is the installation's.
if not "%NO_PAUSE%"=="1" pause
exit /b %RC%
