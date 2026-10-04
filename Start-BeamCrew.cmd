@echo off
setlocal
cd /d "%~dp0"
set "BEAM_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%BEAM_NODE%" set "BEAM_NODE=node"
if not exist "node_modules\typescript\bin\tsc" goto dependencies
"%BEAM_NODE%" node_modules\typescript\bin\tsc --noEmit
if errorlevel 1 goto failed
"%BEAM_NODE%" node_modules\typescript\bin\tsc -p tsconfig.server.json
if errorlevel 1 goto failed
"%BEAM_NODE%" node_modules\vite\bin\vite.js build
if errorlevel 1 goto failed
set "NODE_ENV=production"
if not defined PORT set "PORT=2568"
echo Open http://localhost:%PORT% on this laptop. Keep this window open.
echo Press Ctrl+C to stop the server.
"%BEAM_NODE%" build\server\index.js
if errorlevel 1 goto failed
exit /b 0
:dependencies
echo Dependencies are missing. Install Node.js 24 and run corepack pnpm install.
pause
exit /b 1
:failed
echo Beam Crew could not start. Keep the error above for troubleshooting.
pause
exit /b 1
