require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function compile() {
  const move = new cli.Move();
  // Build a safe namedAddresses object: only include entries that are defined and stringify values
  const namedAddresses = {};
  if (process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
    namedAddresses.message_board_addr = String(process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS);
  }

  // ts-sdk expects a namedAddresses object (may not handle undefined), so always pass an object
  const compileArgs = {
    packageDirectoryPath: "contract",
    namedAddresses: namedAddresses,
  };

  // Use dev addresses from contract/Move.toml when available
  compileArgs.extraArguments = ["--dev"];

  await move.compile(compileArgs);
}
compile();
