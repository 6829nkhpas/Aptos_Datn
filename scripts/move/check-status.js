/**
 * Check Local Node Status
 * Displays information about the local blockchain
 */

const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

async function checkStatus() {
  console.log('🔍 Checking Local Node Status...\n');

  const config = new AptosConfig({
    network: Network.LOCAL,
    fullnode: 'http://localhost:8080',
    faucet: 'http://localhost:8081'
  });
  const aptos = new Aptos(config);

  try {
    // Get ledger info
    const ledgerInfo = await aptos.getLedgerInfo();

    console.log('✅ Local Node is Running!\n');
    console.log('📊 Blockchain Info:');
    console.log(`   Chain ID: ${ledgerInfo.chain_id}`);
    console.log(`   Ledger Version: ${ledgerInfo.ledger_version}`);
    console.log(`   Epoch: ${ledgerInfo.epoch}`);
    console.log(`   Block Height: ${ledgerInfo.block_height}`);

    // Check if publisher account exists
    if (process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
      console.log('\n📍 Publisher Account:');
      console.log(`   Address: ${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS}`);

      try {
        const balance = await aptos.getAccountAPTAmount({
          accountAddress: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS
        });
        console.log(`   Balance: ${balance / 100000000} APT`);

        // Check if contracts are deployed
        const modules = await aptos.getAccountModules({
          accountAddress: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS
        });

        if (modules.length > 0) {
          console.log(`\n📦 Deployed Modules (${modules.length}):`);
          modules.forEach(module => {
            console.log(`   - ${module.abi.name}`);
          });
        } else {
          console.log('\n⚠️  No modules deployed yet');
          console.log('   Run: npm run move:deploy-local');
        }
      } catch (error) {
        console.log('   ⚠️  Account not found on chain');
      }
    } else {
      console.log('\n⚠️  Publisher account not configured');
      console.log('   Run: npm run move:init-accounts');
    }

    console.log('\n🌐 Endpoints:');
    console.log('   REST API: http://localhost:8080');
    console.log('   Faucet:   http://localhost:8081');
    console.log('   Explorer: http://localhost:8080/v1/');

  } catch (error) {
    console.error('❌ Cannot connect to local node');
    console.error('   Make sure the node is running: npm run move:start-node\n');
    process.exit(1);
  }
}

checkStatus().catch(console.error);
