@echo off
echo.
echo ========================================
echo Chronos Protocol - Enhanced Startup Script
echo ========================================
echo.

REM Check for Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js and npm first.
    echo Visit https://nodejs.org/ to download and install Node.js
    pause
    exit /b 1
)

echo Checking Node.js version...
node -v
echo.

REM Change to project directory
cd /d "%~dp0"

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file with required environment variables...
    echo VITE_THIRDWEB_CLIENT_ID=a262c1f3f50486fab730c76223ec8a09 > .env
    echo VITE_ALCHEMY_API_KEY=JHvJUBwzQXxjN9ByrpdPvHVJrKFO7OmW >> .env
    echo VITE_CHRONOS_FACTORY_ADDRESS=0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94 >> .env
    echo ALCHEMY_API_KEY=JHvJUBwzQXxjN9ByrpdPvHVJrKFO7OmW >> .env
    echo HARDHAT_NETWORK=base-sepolia >> .env
    echo .env file created successfully
) else (
    echo .env file already exists
)

echo.
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Starting Chronos Protocol application
echo ========================================
echo.
echo The application will start in development mode
echo You can access it at http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo.

REM Starting both server and client concurrently
start "Chronos Protocol Server" cmd /c "cd server && call npm install && call npm start"
timeout /t 5 /nobreak > nul
start "Chronos Protocol Client" cmd /c "call npm run dev"

echo.
echo Server started in a separate window
echo Client application started in a separate window
echo.
echo If the browser doesn't open automatically, visit:
echo http://localhost:3000
echo.
