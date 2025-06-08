#!/usr/bin/env node
import { cli } from "../src/test/visual-agent/cli/index.js";

// Get command line arguments and remove the first two (node and script path)
const args = process.argv.slice(2);

// Run the CLI with the arguments
cli(args).catch((error) => {
  console.error("❌ Error running visual test agent:", error);
  process.exit(1);
});
