@echo off
setlocal
cd /d "%~dp0"

:: Sblocca automaticamente eventuali file scaricati/estratti
powershell -NoProfile -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File -ErrorAction SilentlyContinue"

:: Se sono passati argomenti da linea di comando, inoltrali direttamente all'installer PowerShell
if not "%~1"=="" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1" %*
    exit /b %ERRORLEVEL%
)

echo ============================================================
echo   KPI Comparison Chart - Apache Superset Plugin Installer
echo   All-in-One KPI Card con Confronto Temporale & Delta %%
echo ============================================================
echo   [1] Esegui Installer PowerShell (install-plugin.ps1) [Consigliato]
echo   [2] Installazione Pulita da Zero (Clean Reinstall)
echo   [3] Installazione con Ricompilazione Frontend Superset (Webpack)
echo   [4] Annulla ed Esci
echo ============================================================
set /p CHOICE="Seleziona un'opzione [1/2/3/4, Invio per default: 1]: "

if "%CHOICE%"=="2" goto run_clean_reinstall
if "%CHOICE%"=="3" goto run_rebuild_all
if "%CHOICE%"=="4" goto end
goto run_ps

:run_ps
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1"
goto end

:run_clean_reinstall
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1" -CleanReinstall
goto end

:run_rebuild_all
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1" -CleanReinstall -RebuildFrontend
goto end

:end
pause
