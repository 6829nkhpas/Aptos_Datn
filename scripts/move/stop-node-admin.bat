@echo off
REM Stop Aptos Local Node with Administrator Privileges
REM This batch file will request admin privileges to kill processes

echo.
echo ========================================
echo   Stopping Aptos Node (Admin Mode)
echo ========================================
echo.

REM Kill process on port 8080
echo Checking port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8080...
    taskkill /PID %%a /F /T
)

REM Kill process on port 8081
echo Checking port 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8081...
    taskkill /PID %%a /F /T
)

REM Clean up .aptos directory
echo.
echo Cleaning up node data...
if exist ".aptos" (
    rmdir /S /Q ".aptos"
    echo Node data cleaned!
) else (
    echo No node data to clean.
)

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo You can now start the node:
echo   npm run move:start-node
echo.

pause
