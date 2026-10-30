@echo off
cd /d "%~dp0"
set PORT=2599
set NODE_ENV=production
node scripts/check-port.mjs %PORT%
if errorlevel 1 exit /b 1
call pnpm build
if errorlevel 1 exit /b 1
node build/server/index.js
