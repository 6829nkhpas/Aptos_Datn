const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");

async function checkAndFund() {
  console.log('💰 Checking Publisher Account Balance...\n');

  const publisherAddress = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
  
  if (!publisherAddress) {
    console.error('❌ Publisher account not found in .env.local');
    console.error('   Run: npm run move:init-accounts\n');
    process.exit(1);
  }

  console.log(`📍 Publisher Address: ${publisherAddress}\n`);

  try {
    // Connect to testnet
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    // Check balance
    console.log('🔍 Checking balance on Testnet...');
    const resources = await aptos.getAccountResources({ accountAddress: publisherAddress });
    
    const aptResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
    
    if (aptResource) {
      const balance = parseInt(aptResource.data.coin.value);
      const balanceAPT = balance / 100000000; // Convert octas to APT
      
      console.log(`✅ Current Balance: ${balanceAPT} APT (${balance} octas)\n`);
      
      if (balanceAPT < 1) {
        console.log('⚠️  Low balance! You need at least 1 APT for deployment.');
        console.log('\n📝 To get test funds:');
        console.log('   1. Visit: https://aptoslabs.com/faucet?network=testnet');
        console.log(`   2. Enter address: ${publisherAddress}`);
        console.log('   3. Click "Mint"');
        console.log('   4. Wait ~30 seconds for confirmation');
        console.log('   5. Run this script again to verify\n');
      } else {
        console.log('✅ Balance is sufficient for deployment!');
        console.log('   You can now run: npm run move:publish -- --network testnet\n');
      }
    } else {
      console.log('❌ Account not found on testnet or has no APT.');
      console.log('\n📝 This means the account needs to be funded:');
      console.log('   1. Visit: https://aptoslabs.com/faucet?network=testnet');
      console.log(`   2. Enter address: ${publisherAddress}`);
      console.log('   3. Click "Mint"');
      console.log('   4. Wait ~30 seconds');
      console.log('   5. Run this script again\n');
    }

  } catch (error) {
    if (error.message && error.message.includes('Account not found')) {
      console.log('❌ Account does not exist on testnet yet.');
      console.log('\n📝 You need to fund it first:');
      console.log('   1. Visit: https://aptoslabs.com/faucet?network=testnet');
      console.log(`   2. Enter address: ${publisherAddress}`);
      console.log('   3. Click "Mint" to create and fund the account');
      console.log('   4. Wait ~30 seconds');
      console.log('   5. Run this script again\n');
    } else {
      console.error('❌ Error checking balance:',  error.message);
      console.error('\nPlease check:');
      console.error('   1. Network connectivity');
      console.error('   2. Publisher address is valid');
      console.error('   3. Aptos testnet is operational\n');
    }
  }
}

checkAndFund();
