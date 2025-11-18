/**
 * Initialize Local Accounts
 * Creates and funds accounts for local development
 */

require('dotenv').config();
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Helper function to fund account using direct HTTP request
async function fundAccountDirect(address, amount) {
  return new Promise((resolve, reject) => {
    const postData = '';
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/mint?amount=${amount}&address=${address}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Faucet request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function initializeAccounts() {
  console.log('🔐 Initializing Local Accounts...\n');

  // Connect to local node
  const config = new AptosConfig({
    network: Network.LOCAL,
    fullnode: 'http://localhost:8080',
    faucet: 'http://localhost:8081'
  });
  const aptos = new Aptos(config);

  try {
    // Check if node is running
    await aptos.getLedgerInfo();
    console.log('✅ Connected to local Aptos node\n');
  } catch (error) {
    console.error('❌ Cannot connect to local node. Make sure it\'s running:');
    console.error('   npm run move:start-node\n');
    process.exit(1);
  }

  // Create or load publisher account
  let publisherAccount;
  const envPath = path.join(process.cwd(), '.env.local');

  if (process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    console.log('📥 Loading existing publisher account...');
    const privateKey = new Ed25519PrivateKey(process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY);
    publisherAccount = Account.fromPrivateKey({ privateKey });
  } else {
    console.log('🆕 Creating new publisher account...');
    publisherAccount = Account.generate();

    // Save to .env.local
    const envContent = `
# Local Development Accounts (DO NOT COMMIT TO GIT)
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}
NEXT_PUBLIC_APP_NETWORK=local
`;

    fs.writeFileSync(envPath, envContent.trim());
    console.log('💾 Saved account to .env.local');
  }

  console.log(`\n📍 Publisher Account: ${publisherAccount.accountAddress.toString()}`);

  // Fund the account using local faucet
  try {
    console.log('\n💰 Funding publisher account...');

    const txns = await fundAccountDirect(
      publisherAccount.accountAddress.toString(),
      100000000 // 1 APT
    );

    console.log(`✅ Funding transaction: ${txns[0]}`);

    // Wait for transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check balance
    try {
      const balance = await aptos.getAccountAPTAmount({
        accountAddress: publisherAccount.accountAddress
      });
      console.log(`✅ Account funded! Balance: ${balance / 100000000} APT`);
    } catch (e) {
      console.log('✅ Account funded! (balance check skipped)');
    }
  } catch (error) {
    console.error('⚠️  Funding failed:', error.message);
    console.log('💡 You can fund manually using:');
    console.log(`   curl -X POST "http://localhost:8081/mint?amount=100000000&address=${publisherAccount.accountAddress.toString()}"\n`);
  }  // Create test buyer and seller accounts
  console.log('\n👥 Creating test user accounts...');

  const buyerAccount = Account.generate();
  const sellerAccount = Account.generate();

  try {
    console.log('💰 Funding buyer account...');
    await fundAccountDirect(
      buyerAccount.accountAddress.toString(),
      50000000 // 0.5 APT
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('💰 Funding seller account...');
    await fundAccountDirect(
      sellerAccount.accountAddress.toString(),
      50000000 // 0.5 APT
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`\n📍 Test Buyer:  ${buyerAccount.accountAddress.toString()}`);
    console.log(`   Private Key: ${buyerAccount.privateKey.toString()}`);
    console.log(`\n📍 Test Seller: ${sellerAccount.accountAddress.toString()}`);
    console.log(`   Private Key: ${sellerAccount.privateKey.toString()}`);

    console.log('\n✅ All accounts initialized and funded!');
  } catch (error) {
    console.error('⚠️  Error creating test accounts:', error.message);
    console.log('\n💡 You can fund them manually later using the faucet:');
    console.log(`   curl -X POST "http://localhost:8081/mint?amount=50000000&address=<ADDRESS>"\n`);
  }
  console.log('\n📝 Next steps:');
  console.log('   1. Update Move.toml with publisher address');
  console.log('   2. Run: npm run move:compile');
  console.log('   3. Run: npm run move:publish');
  console.log('   4. Run: npm run dev\n');
}

initializeAccounts().catch(console.error);
