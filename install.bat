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
echo   [2] Avvia Interfaccia Grafica Windows (KPIComparisonInstallerGUI.exe)
echo   [3] Installazione Pulita da Zero (Clean Reinstall)
echo   [4] Ricompila ed Avvia Docker non-dev (up -d --build superset)
echo   [5] Annulla ed Esci
echo ============================================================
set /p CHOICE="Seleziona un'opzione [1/2/3/4/5, Invio per default: 1]: "

if "%CHOICE%"=="2" goto run_gui
if "%CHOICE%"=="3" goto run_clean_reinstall
if "%CHOICE%"=="4" goto run_docker_non_dev
if "%CHOICE%"=="5" goto end
goto run_ps

:run_ps
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1"
goto end

:run_gui
if exist "%~dp0KPIComparisonInstallerGUI.exe" (
    echo Avvio interfaccia grafica KPIComparisonInstallerGUI.exe...
    start "" "%~dp0KPIComparisonInstallerGUI.exe"
    exit /b 0
) else (
    echo [ERRORE] KPIComparisonInstallerGUI.exe non trovato!
    pause
    exit /b 1
)

:run_clean_reinstall
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1" -CleanReinstall
goto end

:run_docker_non_dev
echo Sincronizzazione file plugin nel repository Superset...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1"
if exist "C:\Users\admmaps\superset_6_1_0\superset\docker-compose-non-dev.yml" (
    cd /d "C:\Users\admmaps\superset_6_1_0\superset"
    echo Esecuzione: docker compose -f docker-compose-non-dev.yml up -d --build superset
    docker compose -f docker-compose-non-dev.yml up -d --build superset
) else (
    echo [INFO] Per avviare Docker, esegui nella cartella di Superset:
    echo docker compose -f docker-compose-non-dev.yml up -d --build superset
)
goto end

:end
pause
