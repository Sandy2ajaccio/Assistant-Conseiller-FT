@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 goto :git_absent
where npm.cmd >nul 2>nul
if errorlevel 1 goto :npm_absent

echo.
echo [1/5] Verification des routes...
cd /d "%~dp0frontend"
call npm.cmd run check:routes
if errorlevel 1 goto :controle_echec

echo.
echo [2/5] Construction du site...
call npm.cmd run build
if errorlevel 1 goto :controle_echec

echo.
echo [3/5] Sauvegarde locale...
cd /d "%~dp0"
git add -A
if errorlevel 1 goto :git_echec
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Sauvegarde automatique Cap Decision FT"
  if errorlevel 1 goto :git_echec
) else (
  echo Aucun nouveau changement a enregistrer.
)

echo.
echo [4/5] Envoi vers GitHub...
git push origin main
if errorlevel 1 goto :push_echec

echo.
echo [5/5] Publication du site Firebase...
cd /d "%~dp0frontend"
call npx.cmd --yes firebase-tools@15.25.0 deploy --only hosting --project cap-decision-ft
if errorlevel 1 goto :firebase_echec

echo.
echo TERMINE : GitHub et le site public sont a jour.
echo https://cap-decision-ft.firebaseapp.com
start "" "https://cap-decision-ft.firebaseapp.com"
pause
exit /b 0

:controle_echec
echo.
echo ARRET : un controle a echoue. Rien n'a ete publie.
pause
exit /b 1

:git_echec
echo.
echo ARRET : la sauvegarde Git locale a echoue. Rien n'a ete envoye.
pause
exit /b 1

:push_echec
echo.
echo ARRET : la sauvegarde locale existe, mais GitHub n'a pas pu etre mis a jour.
pause
exit /b 1

:firebase_echec
echo.
echo ATTENTION : GitHub est a jour, mais la publication Firebase a echoue.
pause
exit /b 1

:git_absent
echo Git est absent de cet ordinateur.
pause
exit /b 1

:npm_absent
echo Node.js et npm sont absents de cet ordinateur.
pause
exit /b 1
