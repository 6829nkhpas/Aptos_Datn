/**
 * Stop Aptos Local Node and Clean Up
 * Kills processes on ports 8080 and 8081 and cleans node data
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛑 Stopping Aptos Local Node...\n');

// Kill processes on port 8080 and 8081
function killPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        console.log(`✓ Port ${port} is free`);
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
        console.log(`✓ Port ${port} is free`);
        resolve();
        return;
      }

      console.log(`Killing process(es) on port ${port}...`);

      let killed = 0;
      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F /T`, (err) => {
          if (!err) killed++;
          if (killed === pids.size || err) {
            if (err) {
              console.log(`⚠️  Could not kill process ${pid} - may need Administrator privileges`);
            } else {
              console.log(`✓ Port ${port} freed`);
            }
            resolve();
          }
        });
      });
    });
  });
}

async function cleanup() {
  // Kill processes
  await killPort(8080);
  await killPort(8081);

  // Clean up .aptos directory
  const aptosDir = path.join(process.cwd(), '.aptos');
  if (fs.existsSync(aptosDir)) {
    console.log('\n🗑️  Cleaning up node data...');
    try {
      fs.rmSync(aptosDir, { recursive: true, force: true });
      console.log('✓ Node data cleaned');
    } catch (error) {
      console.log('⚠️  Could not remove .aptos directory:', error.message);
    }
  }

  console.log('\n✅ Cleanup complete!\n');
  console.log('💡 You can now start the node again:');
  console.log('   npm run move:start-node\n');
}

cleanup().catch(console.error);
