@echo off
echo ==== Chronos Protocol - Modern Blockchain Agreements ====
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

REM Check for necessary files
if not exist "server\package.json" (
    echo ERROR: Server package.json not found
    echo Make sure you're running this from the correct directory
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERROR: Root package.json not found
    echo Make sure you're running this from the correct directory
    pause
    exit /b 1
)

echo.
echo Basic environment checks passed!
echo.

REM Ask if user wants to run detailed verification
set /p RUN_VERIFY="Run detailed system verification? (Y/N) [Recommended]: "
if /i "%RUN_VERIFY%"=="Y" (
    echo Running system verification...
    node verify-system.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo System verification failed. Please fix the issues before continuing.
        echo See USER_GUIDE.md for troubleshooting help.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo System verification passed!
    echo.
)

REM Check for environment variables
if not exist ".env" (
    echo WARNING: No .env file found
    echo Creating a basic .env file with default values...
    echo BASE_SEPOLIA_RPC_URL=https://sepolia.base.org > .env
    echo THIRDWEB_CLIENT_ID=a262c1f3f50486fab730c76223ec8a09 >> .env
    echo ALCHEMY_API_KEY=JHvJUBwzQXxjN9ByrpdPvHVJrKFO7OmW >> .env
    echo.
    echo Created .env with default values
    echo For production use, please update these values with your own keys
    echo.
)

echo Starting backend server...
start cmd /k "cd /d %~dp0 && cd server && npm start"
echo.

echo Starting frontend development server...
start cmd /k "cd /d %~dp0 && npm run dev"
echo.

echo Chronos Protocol is starting! Check the terminal windows for details.
echo.
echo If you encounter issues, please see the USER_GUIDE.md for troubleshooting help.
echo.
echo You can also use "npm run dev:all" to start both servers in one terminal window.
echo.
echo Visit http://localhost:3000 in your browser when the servers are ready.
echo.
