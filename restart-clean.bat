@echo off
echo.
echo ========================================
echo   QUICK FIX: Clear Cache and Restart
echo ========================================
echo.
echo Step 1: Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo [OK] .next folder removed
) else (
    echo [OK] .next folder already clean
)
echo.
echo Step 2: Starting dev server...
echo.
echo IMPORTANT:
echo 1. After server starts, open browser
echo 2. Press Ctrl+Shift+R to hard refresh
echo 3. Clear browser cache (Ctrl+Shift+Delete)
echo 4. Check console for: api.TESTNET.aptoslabs.com (not mainnet!)
echo.
echo ========================================
echo.
npm run dev
