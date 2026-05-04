@echo off
start "Server" cmd /k "cd /d C:\Users\User\unitalk\unitalk && node server/index.js"
timeout /t 2 >nul
start "Ngrok" cmd /k "cd /d C:\Users\User\unitalk\unitalk && .\ngrok.exe http 3000"