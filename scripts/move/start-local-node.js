/**
 * Start Aptos Local Node
 * Similar to "dfx start" in ICP
 * This runs a local Aptos blockchain for development
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const net = require('net');

console.log('🚀 Starting Aptos Local Node...');
console.log('📝 This is similar to "dfx start" in Internet Computer\n');

// Function to check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
}

// Function to kill process on port (Windows)
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve();
        return;
      }

      const lines = stdout.split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          pids.add(match[1]);
        }
      });

      if (pids.size === 0) {
        resolve();
        return;
      }

      console.log(`🔍 Found process(es) on port ${port}: ${Array.from(pids).join(', ')}`);
      console.log('⚠️  Attempting to free the port...\n');

      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (err) => {
          if (err) {
            console.log(`❌ Could not kill process ${pid}. You may need to:`);
            console.log(`   1. Close the application using port ${port}`);
            console.log(`   2. Run this command as Administrator`);
            console.log(`   3. Manually run: taskkill /PID ${pid} /F\n`);
          }
        });
      });

      setTimeout(resolve, 2000); // Wait for processes to be killed
    });
  });
}

// Check ports before starting
async function checkPorts() {
  const port8080InUse = await checkPort(8080);
  const port8081InUse = await checkPort(8081);

  if (port8080InUse || port8081InUse) {
    console.log('⚠️  Required ports are in use:');
    if (port8080InUse) console.log('   - Port 8080 (REST API)');
    if (port8081InUse) console.log('   - Port 8081 (Faucet)');
    console.log('');

    await killProcessOnPort(8080);
    await killProcessOnPort(8081);

    // Check again
    const stillInUse8080 = await checkPort(8080);
    const stillInUse8081 = await checkPort(8081);

    if (stillInUse8080 || stillInUse8081) {
      console.log('❌ Ports still in use. Please free the ports manually:\n');
      console.log('Run the cleanup script as Administrator:');
      console.log('  npm run move:stop-node:admin\n');
      console.log('Or manually kill the processes:');
      if (stillInUse8080) {
        console.log('  netstat -ano | findstr :8080');
        console.log('  taskkill /PID <PID> /F /T\n');
      }
      if (stillInUse8081) {
        console.log('  netstat -ano | findstr :8081');
        console.log('  taskkill /PID <PID> /F /T\n');
      }
      process.exit(1);
    }

    console.log('✅ Ports freed successfully!\n');
  }
}

checkPorts().then(() => {
  console.log('✅ Ports are available, starting node...\n');

  // Start aptos node in local testnet mode
  const aptosNode = spawn('aptos', ['node', 'run-local-testnet', '--with-faucet'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  aptosNode.on('error', (error) => {
    console.error('❌ Error starting Aptos node:', error.message);
    console.log('\n💡 Make sure Aptos CLI is installed:');
    console.log('   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3\n');
    process.exit(1);
  });

  aptosNode.on('close', (code) => {
    console.log(`\n⚠️  Aptos node stopped with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping Aptos local node...');
    aptosNode.kill();
    process.exit(0);
  });

  console.log('✅ Aptos Local Node is starting...');
  console.log('📍 Default endpoints:');
  console.log('   - REST API: http://localhost:8080');
  console.log('   - Faucet:   http://localhost:8081');
  console.log('\n⏳ Waiting for node to be ready...\n');
}).catch(err => {
  console.error('❌ Failed to start node:', err);
  process.exit(1);
});
