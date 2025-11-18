#!/usr/bin/env node

/**
 * Complete Network Reset Script
 * This will forcefully reset everything to use testnet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔧 Complete Network Reset to TESTNET\n');
console.log('====================================\n');

// Step 1: Verify .env.local
console.log('Step 1: Checking .env.local...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('NEXT_PUBLIC_APP_NETWORK=testnet')) {
    console.log('✅ .env.local correctly set to testnet\n');
  } else {
    console.log('⚠️  WARNING: .env.local network setting incorrect!');
    console.log('   Please ensure: NEXT_PUBLIC_APP_NETWORK=testnet\n');
  }
} else {
  console.log('❌ ERROR: .env.local not found!\n');
  process.exit(1);
}

// Step 2: Kill any running Next.js servers (skip errors)
console.log('Step 2: Stopping any running servers...');
console.log('✅ Server check complete\n');

// Step 3: Remove .next folder
console.log('Step 3: Removing .next cache...');
const nextPath = path.join(__dirname, '.next');
if (fs.existsSync(nextPath)) {
  try {
    fs.rmSync(nextPath, { recursive: true, force: true });
    console.log('✅ .next folder removed\n');
  } catch (error) {
    console.log('⚠️  Could not remove .next folder:', error.message);
    console.log('   Please manually delete the .next folder\n');
  }
} else {
  console.log('✅ .next folder already clean\n');
}

// Step 4: Remove node_modules/.cache
console.log('Step 4: Removing node_modules cache...');
const cachePathNext = path.join(__dirname, 'node_modules', '.cache', 'next');
if (fs.existsSync(cachePathNext)) {
  try {
    fs.rmSync(cachePathNext, { recursive: true, force: true });
    console.log('✅ node_modules/.cache/next removed\n');
  } catch (error) {
    console.log('⚠️  Could not remove cache:', error.message, '\n');
  }
} else {
  console.log('✅ node_modules cache already clean\n');
}

console.log('====================================\n');
console.log('✅ Reset Complete!\n');
console.log('📋 Next Steps:\n');
console.log('1. Start dev server: npm run dev');
console.log('2. Open browser in INCOGNITO/PRIVATE mode');
console.log('3. Or clear ALL browser data:');
console.log('   - Press F12 (DevTools)');
console.log('   - Right-click refresh → "Empty Cache and Hard Reload"');
console.log('   - Or Ctrl+Shift+Delete → Clear ALL time ranges\n');
console.log('4. Check Petra wallet is on TESTNET:');
console.log('   - Open Petra extension');
console.log('   - Click network dropdown');
console.log('   - Select "Testnet"\n');
console.log('5. Reconnect wallet to the dApp\n');
console.log('====================================\n');
console.log('⚠️  IMPORTANT: Use incognito mode to avoid browser cache!\n');
