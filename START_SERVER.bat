@echo off
echo Checking for processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5000
    taskkill /PID %%a /F >nul 2>&1
)

echo Starting server...
cd server
node server.js
pause
