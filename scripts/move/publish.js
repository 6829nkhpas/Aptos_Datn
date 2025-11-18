const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const fs = require("node:fs");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk");

async function publish() {
  console.log('📦 Publishing Smart Contracts...\n');

  // Check if publisher account exists
  if (!process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    console.error('❌ Publisher account not found!');
    console.error('   Run: npm run move:init-accounts\n');
    process.exit(1);
  }

  console.log(`📍 Publisher: ${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS}`);

  // Determine the network URL
  let networkUrl = 'http://localhost:8080';
  const network = process.env.NEXT_PUBLIC_APP_NETWORK || 'local';

  if (network !== 'local') {
    networkUrl = aptosSDK.NetworkToNodeAPI[network];
  }

  console.log(`🌐 Network: ${network} (${networkUrl})\n`);

  const move = new cli.Move();

  try {
    console.log('⚠️  You will be prompted to confirm the deployment.\n');
    
    const response = await move.createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "ecommerce_platform",
      namedAddresses: {
        ecommerce_platform: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      },
      extraArguments: [
        `--private-key=${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,
        `--url=${networkUrl}`,
        `--max-gas=300000`,  // Further increased gas limit
        `--gas-unit-price=100`,
        `--assume-yes`
      ],
    });

    console.log('✅ Contracts published successfully!\n');
    console.log(`📦 Object Address: ${response.objectAddress}\n`);

    // Update .env or .env.local file
    const envFile = network === 'local' ? '.env.local' : '.env';
    const filePath = path.join(__dirname, '..', '..', envFile);
    let envContent = "";

    // Check .env file exists and read it
    if (fs.existsSync(filePath)) {
      envContent = fs.readFileSync(filePath, "utf8");
    }

    // Regular expression to match the NEXT_PUBLIC_MODULE_ADDRESS variable
    const regex = /^NEXT_PUBLIC_MODULE_ADDRESS=.*$/m;
    const newEntry = `NEXT_PUBLIC_MODULE_ADDRESS=${response.objectAddress}`;

    // Check if NEXT_PUBLIC_MODULE_ADDRESS is already defined
    if (envContent.match(regex)) {
      // If the variable exists, replace it with the new value
      envContent = envContent.replace(regex, newEntry);
    } else {
      // If the variable does not exist, append it
      envContent += `\n${newEntry}`;
    }

    // Write the updated content back to the .env file
    fs.writeFileSync(filePath, envContent, "utf8");
    console.log(`💾 Module address saved to ${envFile}\n`);

    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Connect your Petra wallet');
    console.log('   3. Start using the dApp!\n');
  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

publish();
