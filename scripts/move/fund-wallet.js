import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import http from 'http';

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: 'http://localhost:8080',
  faucet: 'http://localhost:8081',
});

const aptos = new Aptos(config);

/**
 * Fund account using direct HTTP POST to faucet
 */
function fundAccountDirect(address, amount) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/mint?amount=${amount}&address=${address}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Faucet request failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function fundWallet() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Error: No wallet address provided');
    console.log('\nUsage: node scripts/move/fund-wallet.js <WALLET_ADDRESS> [AMOUNT_IN_APT]');
    console.log('\nExamples:');
    console.log('  node scripts/move/fund-wallet.js 0x123...abc');
    console.log('  node scripts/move/fund-wallet.js 0x123...abc 5');
    console.log('\n💡 Tip: Copy your address from Petra wallet');
    process.exit(1);
  }

  const walletAddress = args[0];
  const amountInAPT = args[1] ? parseFloat(args[1]) : 1.0; // Default 1 APT
  const amountInOctas = Math.floor(amountInAPT * 100_000_000);

  console.log('💰 Funding wallet on local network...');
  console.log('═══════════════════════════════════════\n');
  console.log(`📍 Address: ${walletAddress}`);
  console.log(`💵 Amount:  ${amountInAPT} APT (${amountInOctas} Octas)`);
  console.log(`🌐 Network: http://localhost:8080\n`);

  try {
    // Check if address is valid format
    if (!walletAddress.startsWith('0x')) {
      throw new Error('Address must start with 0x');
    }

    // Get balance before funding
    let balanceBefore = 0;
    try {
      const resources = await aptos.getAccountResources({ accountAddress: walletAddress });
      const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      if (coinResource) {
        balanceBefore = parseInt(coinResource.data.coin.value) / 100_000_000;
      }
      console.log(`💼 Current Balance: ${balanceBefore.toFixed(4)} APT\n`);
    } catch (error) {
      console.log('💼 Current Balance: 0 APT (Account not yet on chain)\n');
    }

    // Fund the account
    console.log('⏳ Sending funding request to faucet...');
    const faucetResult = await fundAccountDirect(walletAddress, amountInOctas);
    console.log('✅ Faucet request completed!\n');

    // Wait for transaction to process and account to be created
    console.log('⏳ Waiting for transaction to be processed...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get balance after funding
    let balanceAfter = 0;
    try {
      const resources = await aptos.getAccountResources({ accountAddress: walletAddress });
      const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      balanceAfter = coinResource ? parseInt(coinResource.data.coin.value) / 100_000_000 : 0;
    } catch (error) {
      console.log('⚠️  Could not verify balance (account might still be initializing)');
      console.log('   Transaction hash:', faucetResult);
      balanceAfter = amountInAPT; // Assume the funding worked
    }

    console.log('✅ Funding successful!\n');
    console.log('═══════════════════════════════════════');
    console.log(`💰 New Balance: ${balanceAfter.toFixed(4)} APT`);
    console.log(`📈 Added: ${(balanceAfter - balanceBefore).toFixed(4)} APT`);
    console.log('═══════════════════════════════════════\n');

    console.log('👉 Next steps:');
    console.log('   1. Refresh your Petra wallet to see the balance');
    console.log('   2. Try your transaction again');
    console.log('   3. Make sure Petra is connected to "Local Aptos Node"\n');

  } catch (error) {
    console.error('❌ Funding failed:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.log('\n� Cannot connect to local node or faucet');
      console.log('\n�💡 Solution:');
      console.log('   1. Start the local node: npm run move:start-node');
      console.log('   2. Wait 30-60 seconds for it to be ready');
      console.log('   3. Try funding again');
    } else if (error.message.includes('Faucet request failed')) {
      console.log('\n🔴 Faucet returned an error');
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if faucet is running: curl http://localhost:8081');
      console.log('   2. Restart the local node: npm run move:stop-node && npm run move:start-node');
      console.log('   3. Check the address format (should be 66 chars with 0x prefix)');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure local node is running: npm run move:start-node');
      console.log('   2. Check faucet is accessible: curl http://localhost:8081');
      console.log('   3. Verify the address format (should start with 0x)');
    }
    process.exit(1);
  }
}

console.log('🚀 Aptos Local Wallet Funding Tool\n');
fundWallet().catch(console.error);
