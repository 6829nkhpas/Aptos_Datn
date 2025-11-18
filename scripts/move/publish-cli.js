const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { execSync } = require('child_process');
const fs = require('fs');

async function publish() {
  console.log('📦 Publishing Smart Contracts to Testnet...\n');

  // Check if publisher account exists
  if (!process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    console.error('❌ Publisher account not found!');
    console.error('   Run: npm run move:init-accounts\n');
    process.exit(1);
  }

  const publisherAddress = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
  const privateKey = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;

  console.log(`📍 Publisher: ${publisherAddress}`);
  console.log(`🌐 Network: testnet\n`);

  try {
    // Use Aptos CLI directly for more reliable deployment
    console.log('🔨 Compiling contracts...\n');
    
    const compileCmd = `cd contract && aptos move compile --named-addresses ecommerce_platform=${publisherAddress}`;
    execSync(compileCmd, { stdio: 'inherit' });
    
    console.log('\n📤 Publishing to testnet...\n');
    
    // Publish using Aptos CLI with proper gas settings
    const publishCmd = `cd contract && aptos move create-object-and-publish-package --address-name ecommerce_platform --named-addresses ecommerce_platform=${publisherAddress} --private-key ${privateKey} --url https://api.testnet.aptoslabs.com/v1 --max-gas 200000 --assume-yes`;
    
    const output = execSync(publishCmd, { encoding: 'utf-8' });
    console.log(output);
    
    // Extract object address from output
    const objectAddressMatch = output.match(/Code was successfully deployed to object address (0x[a-fA-F0-9]+)/);
    
    if (objectAddressMatch) {
      const objectAddress = objectAddressMatch[1];
      console.log(`\n✅ Contracts published successfully!`);
      console.log(`📦 Object Address: ${objectAddress}\n`);

      // Update .env file
      const envFilePath = path.join(__dirname, '..', '..', '.env');
      let envContent = '';

      if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
      }

      const regex = /^NEXT_PUBLIC_MODULE_ADDRESS=.*$/m;
      const newEntry = `NEXT_PUBLIC_MODULE_ADDRESS=${objectAddress}`;

      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, newEntry);
      } else {
        envContent += `\n${newEntry}`;
      }

      fs.writeFileSync(envFilePath, envContent, 'utf8');
      console.log(`💾 Module address saved to .env\n`);

      console.log('📝 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Connect your Petra wallet');
      console.log('   3. Start using the dApp!\n');
    } else {
      console.log('\n✅ Publishing completed, but could not extract object address from output.');
      console.log('   Please check the output above for the deployed address.\n');
    }

  } catch (error) {
    console.error('\n❌ Publishing failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
      console.error('\n💡 Solution: Get more test APT from the faucet:');
      console.error('   https://aptoslabs.com/faucet?network=testnet');
      console.error(`   Address: ${publisherAddress}\n`);
    } else if (error.message.includes('MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS')) {
      console.error('\n💡 Solution: Try increasing gas limit:');
      console.error('   Edit this script and change --max-gas to 300000\n');
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your publisher account has test APT');
      console.error('   2. Verify network connectivity');
      console.error('   3. Try again in a few moments\n');
    }
    
    process.exit(1);
  }
}

publish();
