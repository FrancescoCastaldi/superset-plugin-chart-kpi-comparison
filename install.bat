@echo off
REM KPI Comparison Chart Plugin Installer Runner
echo Avvio installazione KPI Comparison Chart Plugin per Apache Superset...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1" %*
pause
