import { Account, Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '..', '.env.local') });

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: 'http://localhost:8080',
  faucet: 'http://localhost:8081',
});

const aptos = new Aptos(config);
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

async function testRegister() {
  try {
    // Load publisher account
    const privateKeyHex = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
    if (!privateKeyHex) {
      throw new Error('NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY not found in .env.local');
    }

    if (!MODULE_ADDRESS) {
      throw new Error('NEXT_PUBLIC_MODULE_ADDRESS not found in .env.local');
    }

    const account = Account.fromPrivateKey({ privateKey: privateKeyHex });

    console.log('📝 Registering user:', account.accountAddress.toString());
    console.log('📦 Module address:', MODULE_ADDRESS);

    // Build transaction - matching your UI parameters
    // Function signature: register_profile(name, country, role, email, physical_address, bio)
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::user_profile::register_profile`,
        typeArguments: [],
        functionArguments: [
          'Yash Rana',             // name
          'India',                 // country
          2,                       // role (2 = Seller, 1 = Buyer)
          'devopsai209@gmail.com', // email
          'l-558',                 // physical_address
          '',                      // bio
        ],
      },
    });

    console.log('📤 Submitting transaction...');

    // Sign and submit
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    console.log('⏳ Waiting for confirmation...');

    // Wait for confirmation
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

    console.log('✅ Registration successful!');
    console.log('🔗 Transaction hash:', committedTxn.hash);
    console.log('\n📊 Verify on blockchain:');
    console.log(`   curl http://localhost:8080/v1/accounts/${account.accountAddress.toString()}/resources`);

  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

console.log('🚀 Starting test registration...');
console.log('🌐 Network: Local (http://localhost:8080)\n');

testRegister().catch(console.error);
