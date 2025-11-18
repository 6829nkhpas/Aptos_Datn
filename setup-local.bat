@echo off
echo ========================================
echo   Aptos Local Development Setup
echo ========================================
echo.

echo Step 1: Checking Aptos CLI...
aptos --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Aptos CLI not found!
    echo.
    echo Please install it first:
    echo   iwr "https://aptos.dev/scripts/install_cli.py" -useb ^| iex
    echo.
    pause
    exit /b 1
)
echo ✓ Aptos CLI installed
echo.

echo Step 2: Installing Node dependencies...
call npm install
echo.

echo Step 3: Starting Aptos local node...
echo This will open a new window - KEEP IT RUNNING!
echo.
start "Aptos Local Node" cmd /k npm run move:start-node
timeout /t 10 /nobreak >nul

echo Step 4: Initializing accounts...
timeout /t 5 /nobreak >nul
call npm run move:init-accounts
echo.

echo Step 5: Deploying smart contracts...
call npm run move:deploy-local
echo.

echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo Your local Aptos blockchain is running!
echo.
echo Next steps:
echo   1. Start your frontend: npm run dev
echo   2. Open http://localhost:3000
echo.
echo Useful commands:
echo   - Check status:  npm run move:status
echo   - Redeploy:      npm run move:deploy-local
echo   - Stop node:     Close the "Aptos Local Node" window
echo.
pause
