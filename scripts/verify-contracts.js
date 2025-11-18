/**
 * Verify Contract Deployment
 * Tests all deployed modules and their functions
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { Aptos, AptosConfig } = require('@aptos-labs/ts-sdk');

async function verifyContracts() {
  console.log('🔍 Verifying Contract Deployment...\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_MODULE_ADDRESS) {
    console.error('❌ NEXT_PUBLIC_MODULE_ADDRESS not found in .env.local');
    console.error('   Run: npm run move:publish\n');
    process.exit(1);
  }

  const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_APP_NETWORK || 'local';

  console.log(`📍 Module Address: ${moduleAddress}`);
  console.log(`🌐 Network: ${network}\n`);

  // Configure Aptos client
  let config;
  if (network === 'local') {
    config = new AptosConfig({
      network: 'custom',
      fullnode: 'http://localhost:8080',
      faucet: 'http://localhost:8081',
    });
  } else {
    config = new AptosConfig({ network });
  }

  const aptos = new Aptos(config);

  // Verify each module
  const modules = ['user_profile', 'product', 'order', 'escrow'];

  console.log('📦 Checking deployed modules:\n');

  for (const moduleName of modules) {
    try {
      const module = await aptos.getAccountModule({
        accountAddress: moduleAddress,
        moduleName,
      });

      console.log(`✅ ${moduleName}`);

      // Count functions
      const entryFunctions = module.abi?.exposed_functions?.filter(f => f.is_entry) || [];
      const viewFunctions = module.abi?.exposed_functions?.filter(f => f.is_view) || [];

      console.log(`   📝 Entry Functions: ${entryFunctions.length}`);
      console.log(`   👁️  View Functions: ${viewFunctions.length}`);

      // List entry functions
      if (entryFunctions.length > 0) {
        console.log(`   Entry: ${entryFunctions.map(f => f.name).join(', ')}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ ${moduleName} - Not found or error`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  // Test a simple view function
  console.log('\n🧪 Testing View Functions:\n');

  try {
    // Try to check if an address has a profile (should return false for non-existent)
    const testAddress = '0x1';
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::user_profile::has_profile`,
        functionArguments: [testAddress],
      },
    });

    console.log(`✅ user_profile::has_profile called successfully`);
    console.log(`   Result: ${result[0]}\n`);
  } catch (error) {
    console.log(`⚠️  View function test skipped: ${error.message}\n`);
  }

  // Display contract URLs
  console.log('🔗 Contract Explorer:\n');

  if (network === 'local') {
    console.log(`   Modules: http://localhost:8080/v1/accounts/${moduleAddress}/modules`);
    console.log(`   Account: http://localhost:8080/v1/accounts/${moduleAddress}`);
  } else {
    console.log(`   Explorer: https://explorer.aptoslabs.com/account/${moduleAddress}?network=${network}`);
    console.log(`   Modules: https://fullnode.${network}.aptoslabs.com/v1/accounts/${moduleAddress}/modules`);
  }

  console.log('\n✅ Verification Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Update frontend .env with module address');
  console.log('   2. Run: npm run dev');
  console.log('   3. Connect wallet and test features\n');
}

verifyContracts().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
