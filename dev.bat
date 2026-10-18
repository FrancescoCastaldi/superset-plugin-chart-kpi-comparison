@echo off
echo ========================================================
echo Avvio KPI Comparison Card Dev Studio (Live Preview)
echo ========================================================
if not exist dev-studio\node_modules (
  echo Installazione dipendenze Dev Studio...
  call npm --prefix dev-studio install
)
call npm --prefix dev-studio run dev
