/**
 * Deploy Contracts to Local Node
 * Compiles and publishes all Move modules
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const cli = require('@aptos-labs/ts-sdk/dist/common/cli/index.js');

async function deployLocal() {
  console.log('📦 Deploying Smart Contracts to Local Node...\n');

  // Check if publisher account exists
  if (!process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    console.error('❌ Publisher account not found!');
    console.error('   Run: npm run move:init-accounts\n');
    process.exit(1);
  }

  // Connect to local node
  const config = new AptosConfig({
    network: Network.LOCAL,
    fullnode: 'http://localhost:8080'
  });
  const aptos = new Aptos(config);

  // Load publisher account
  const privateKey = new Ed25519PrivateKey(process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY);
  const publisherAccount = Account.fromPrivateKey({ privateKey });

  console.log(`📍 Publisher: ${publisherAccount.accountAddress.toString()}\n`);

  // Step 1: Compile contracts
  console.log('🔨 Step 1: Compiling Move contracts...');
  const move = new cli.Move();

  try {
    await move.compile({
      packageDirectoryPath: 'contract',
      namedAddresses: {
        ecommerce_platform: publisherAccount.accountAddress.toString(),
      },
    });
    console.log('✅ Compilation successful!\n');
  } catch (error) {
    console.error('❌ Compilation failed:', error.message);
    console.error(error);
    process.exit(1);
  }

  // Step 2: Publish contracts
  console.log('📤 Step 2: Publishing contracts to local blockchain...');

  try {
    // Read the compiled package
    const fs = require('fs');
    const packagePath = path.join(process.cwd(), 'contract', 'build', 'ecommerce-platform');
    const packageMetadata = fs.readFileSync(path.join(packagePath, 'package-metadata.bcs'));
    const moduleBytecodeDir = path.join(packagePath, 'bytecode_modules');
    const modules = fs.readdirSync(moduleBytecodeDir)
      .filter(f => f.endsWith('.mv'))
      .map(f => fs.readFileSync(path.join(moduleBytecodeDir, f)));

    const transaction = await aptos.publishPackageTransaction({
      account: publisherAccount.accountAddress,
      metadataBytes: packageMetadata,
      moduleBytecode: modules,
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: publisherAccount,
      transaction,
    });

    console.log(`📝 Transaction Hash: ${response.hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    console.log('✅ Contracts deployed successfully!\n');

    // Display deployed modules
    console.log('📋 Deployed Modules:');
    console.log(`   - user_profile`);
    console.log(`   - product`);
    console.log(`   - order`);
    console.log(`   - escrow`);

    console.log('\n🌐 Contract Address:');
    console.log(`   ${publisherAccount.accountAddress.toString()}`);

    console.log('\n🔗 Explorer:');
    console.log(`   http://localhost:8080/v1/accounts/${publisherAccount.accountAddress.toString()}/modules`);

    console.log('\n✅ Deployment complete!');
    console.log('\n📝 Update your frontend .env with:');
    console.log(`   NEXT_PUBLIC_APP_NETWORK=local`);
    console.log(`   NEXT_PUBLIC_MODULE_ADDRESS=${publisherAccount.accountAddress.toString()}`);
    console.log('\n💻 Start your frontend: npm run dev\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

deployLocal().catch(console.error);
