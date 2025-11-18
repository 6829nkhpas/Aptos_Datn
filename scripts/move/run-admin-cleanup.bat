@echo off
REM This script will request Administrator privileges and run the cleanup

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    call "%~dp0stop-node-admin.bat"
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~dp0stop-node-admin.bat' -Verb RunAs"
)
