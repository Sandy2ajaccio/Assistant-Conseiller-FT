@echo off
setlocal
cd /d "%~dp0frontend"

if not exist "node_modules" (
  echo Installation des composants necessaires...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo L'installation a echoue.
    pause
    exit /b 1
  )
)

echo Demarrage local de Cap Decision FT...
echo Cette fenetre doit rester ouverte pendant le developpement.
echo.
echo Adresse : http://localhost:3000
echo.
start "" "http://localhost:3000"
call npm.cmd run dev -- --host 127.0.0.1 --port 3000
