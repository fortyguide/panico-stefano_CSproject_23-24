@echo off
cd /d %~dp0

:: Aggiungi node_portable al PATH
set PATH=%~dp0\node_portable;%PATH%

:: Controlla l'esistenza di npx.cmd
if not exist "%~dp0\node_portable\npx.cmd" (
    echo "Errore: npx.cmd non trovato nel percorso specificato."
    pause
    exit /b 1
)

:: Controlla e installa le dipendenze per il frontend se necessario
if not exist "%~dp0\frontend\node_modules" (
    echo "Installazione delle dipendenze per il frontend..."
    "%~dp0\node_portable\npx.cmd" npm install --prefix frontend
    if errorlevel 1 (
         echo "Errore durante l'installazione delle dipendenze del frontend."
         pause
         exit /b 1
    )
)

:: Controlla e installa le dipendenze per il backend se necessario
if not exist "%~dp0\backend\node_modules" (
    echo "Installazione delle dipendenze per il backend..."
    "%~dp0\node_portable\npx.cmd" npm install --prefix backend
    if errorlevel 1 (
         echo "Errore durante l'installazione delle dipendenze del backend."
         pause
         exit /b 1
    )
)

:: Avvia il backend
echo Avvio backend...
start "" "%~dp0\node_portable\npx.cmd" npm run start --prefix backend
if errorlevel 1 (
    echo "Errore durante l'avvio del backend."
    pause
    exit /b 1
)

:: Avvia il frontend
echo Avvio frontend...
start "" "%~dp0\node_portable\npx.cmd" cross-env PORT=8081 HTTPS=true BROWSER=none npm run start --prefix frontend
if errorlevel 1 (
    echo "Errore durante l'avvio del frontend."
    pause
    exit /b 1
)

:: Attendi che i processi terminino
echo Premi un tasto per terminare...
pause