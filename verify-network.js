#!/usr/bin/env node

/**
 * Network Configuration Verification Script
 * Run this to verify your environment variables are loaded correctly
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Network Configuration Check\n');
console.log('================================');
console.log(`NEXT_PUBLIC_APP_NETWORK: ${process.env.NEXT_PUBLIC_APP_NETWORK || 'NOT SET'}`);
console.log(`NEXT_PUBLIC_MODULE_ADDRESS: ${process.env.NEXT_PUBLIC_MODULE_ADDRESS || 'NOT SET'}`);
console.log(`Publisher Address: ${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS || 'NOT SET'}`);
console.log('================================\n');

// Check if testnet is properly configured
const network = process.env.NEXT_PUBLIC_APP_NETWORK;
const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

if (network !== 'testnet') {
  console.error('❌ ERROR: Network should be "testnet" but is:', network);
  console.log('\n💡 Fix: Update .env.local with:');
  console.log('   NEXT_PUBLIC_APP_NETWORK=testnet\n');
  process.exit(1);
}

if (!moduleAddress || moduleAddress === '0xCAFE') {
  console.warn('⚠️  WARNING: Module address not deployed yet or using placeholder');
  console.log('\n💡 Next steps:');
  console.log('   1. Fund your account: https://aptoslabs.com/faucet?network=testnet');
  console.log('   2. Run: npm run move:check-balance');
  console.log('   3. Run: npm run move:publish -- --network testnet\n');
} else {
  console.log('✅ Module address configured:', moduleAddress);
  console.log(`📍 Check on explorer: https://explorer.aptoslabs.com/account/${moduleAddress}?network=testnet\n`);
}

console.log('✅ Network is correctly set to TESTNET');
console.log('\n🔄 If you still see mainnet errors:');
console.log('   1. Stop dev server (Ctrl+C)');
console.log('   2. Clear browser cache (Ctrl+Shift+Delete)');
console.log('   3. Delete .next folder: rm -rf .next (or rmdir /s .next on Windows)');
console.log('   4. Restart: npm run dev\n');
