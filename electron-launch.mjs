#!/usr/bin/env node
/**
 * Helper script to launch Electron with the proper flags for local development
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// Fix for ESM in Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if Vite server is running
function waitForVite(port = 5174, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkVite() {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        console.log(`✅ Vite server is ready on port ${port}`);
        resolve();
      });

      req.on("error", (err) => {
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
          console.error(
            `❌ Timed out waiting for Vite server after ${timeout}ms`
          );
          reject(new Error(`Vite server not ready after ${timeout}ms`));
        } else {
          console.log(
            `⏳ Waiting for Vite server... (${Math.round(elapsed / 1000)}s)`
          );
          setTimeout(checkVite, 1000);
        }
      });
    }

    checkVite();
  });
}

// Function to start Vite development server
function startVite() {
  console.log("🚀 Starting Vite development server...");
  
  // Set the host explicitly in the environment
  const env = { ...process.env, VITE_HOST: '127.0.0.1' };
  
  // Use the OEW-main directory for running Vite
  const oewMainPath = path.join(__dirname, 'workstation', 'frontend', 'OEW-main');
  console.log(`Starting Vite in directory: ${oewMainPath}`);
  
  const viteProcess = spawn("npm", ["run", "dev:vite"], {
    stdio: "pipe",
    env: env,
    cwd: oewMainPath,
  });

  viteProcess.stdout.on("data", (data) => {
    const output = data.toString();
    if (output.includes("Local:") || output.includes("ready")) {
      console.log("Vite:", output.trim());
    }
  });

  viteProcess.stderr.on("data", (data) => {
    console.error("Vite Error:", data.toString());
  });

  return viteProcess;
}

async function launchElectron() {
  try {
    // Start Vite if not running in packaged mode
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      const viteProcess = startVite();

      // Wait for Vite to be ready
      await waitForVite();

      // Store vite process for cleanup
      process.viteProcess = viteProcess;
    }

    console.log("🚀 Starting Electron...");

    // Add necessary flags for running Electron locally
    const args = process.argv.slice(2);
    if (!args.includes("--no-sandbox")) {
      args.push("--no-sandbox");
    }

    // Set security warnings to be disabled
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
    
    // Set the Vite dev server URL for the Electron app
    process.env.VITE_DEV_SERVER_URL = `http://127.0.0.1:5174`;

    // Launch Electron with the proper flags
    const electronProcess = spawn("npx", ["electron", "."].concat(args), {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });

    electronProcess.on("close", (code) => {
      console.log("🔴 Electron process closed");
      if (process.viteProcess) {
        console.log("🔴 Stopping Vite server...");
        process.viteProcess.kill();
      }
      process.exit(code);
    });
  } catch (error) {
    console.error("❌ Failed to launch Electron:", error.message);
    if (process.viteProcess) {
      process.viteProcess.kill();
    }
    process.exit(1);
  }
}

// Handle cleanup on process termination
process.on("SIGINT", () => {
  console.log("🔴 Received SIGINT, cleaning up...");
  if (process.viteProcess) {
    process.viteProcess.kill();
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🔴 Received SIGTERM, cleaning up...");
  if (process.viteProcess) {
    process.viteProcess.kill();
  }
  process.exit(0);
});

launchElectron();
