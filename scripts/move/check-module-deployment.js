import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '..', '.env.local') });

const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

async function checkModule(endpoint, networkName) {
  try {
    const config = new AptosConfig({
      network: networkName === 'Local' ? Network.CUSTOM : Network.MAINNET,
      fullnode: endpoint,
    });
    const aptos = new Aptos(config);

    console.log(`\n🔍 Checking ${networkName} (${endpoint})...`);

    const modules = await aptos.getAccountModules({
      accountAddress: MODULE_ADDRESS,
    });

    console.log(`✅ ${networkName}: Module FOUND!`);
    console.log(`   Modules: ${modules.length} total`);
    modules.forEach(m => console.log(`   - ${m.abi.name}`));
    return true;

  } catch (error) {
    console.log(`❌ ${networkName}: Module NOT FOUND`);
    console.log(`   Error: ${error.message || error}`);
    return false;
  }
}

async function main() {
  console.log('🔎 Module Deployment Checker');
  console.log('============================');
  console.log(`📦 Module Address: ${MODULE_ADDRESS}`);

  const localExists = await checkModule('http://localhost:8080', 'Local');
  const mainnetExists = await checkModule('https://api.mainnet.aptoslabs.com', 'Mainnet');

  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Local Network:   ${localExists ? '✅ Module exists' : '❌ Module not found'}`);
  console.log(`Mainnet:         ${mainnetExists ? '✅ Module exists' : '❌ Module not found'}`);

  if (localExists && !mainnetExists) {
    console.log('\n⚠️  WARNING: Module only exists on LOCAL network!');
    console.log('');
    console.log('👉 Make sure your Petra wallet is configured for LOCAL network:');
    console.log('   1. Open Petra → Settings → Network');
    console.log('   2. Add network: http://localhost:8080, Chain ID: 4');
    console.log('   3. Switch to "Local Aptos Node"');
    console.log('');
    console.log('📖 Read PETRA_WALLET_FIX.md for detailed instructions');
  }
}

main().catch(console.error);
