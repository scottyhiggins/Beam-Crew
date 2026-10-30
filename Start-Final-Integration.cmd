@echo off
setlocal
cd /d "%~dp0"
set PORT=2615
set NODE_ENV=production
node scripts/check-port.mjs %PORT%
if errorlevel 1 exit /b 1
call pnpm build
if errorlevel 1 exit /b 1
call pnpm start
