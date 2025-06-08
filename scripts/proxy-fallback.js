#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Default fallback manifest.json content
const defaultManifest = {
  name: "Orpheus Engine Workstation",
  short_name: "OEW",
  start_url: ".",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#000000",
  description: "Digital Audio & Video Workstation",
  icons: [
    {
      src: "favicon.ico",
      sizes: "64x64 32x32 24x24 16x16",
      type: "image/x-icon",
    },
  ],
};

// Create a fallback server that responds with manifest.json when the main server is down
function createFallbackServer(port, targetPort) {
  const server = http.createServer((req, res) => {
    if (req.url === "/manifest.json") {
      console.log(`[Fallback] Serving manifest.json on port ${port}`);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(defaultManifest, null, 2));
    } else {
      // For any other request, try to proxy to the original target
      proxyRequest(req, res, targetPort);
    }
  });

  server.listen(port + 1000, "127.0.0.1", () => {
    console.log(`Fallback server running on port ${port + 1000}`);
  });

  return server;
}

// Try to proxy a request to the target port
function proxyRequest(req, res, targetPort) {
  const options = {
    hostname: "localhost",
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => {
    res.statusCode = 502;
    res.end("Bad Gateway - Target service unavailable");
  });

  req.pipe(proxyReq);
}

// Start the target service if available
function startTargetService(port, command, args = []) {
  console.log(`Attempting to start service on port ${port}...`);

  try {
    const service = spawn(command, args, {
      stdio: "inherit",
    });

    service.on("error", (err) => {
      console.error(`Failed to start service: ${err.message}`);
    });

    return service;
  } catch (err) {
    console.error(`Error starting service: ${err.message}`);
    return null;
  }
}

// Update webpack dev config to use fallback server when main server is down
function updateWebpackConfig() {
  const possibleConfigLocations = [
    "./webpack.config.js",
    "../webpack.config.js",
    "/Users/jeldonmusic/Downloads/OEW-main/webpack.config.js",
    "/Users/jeldonmusic/Downloads/OEW-main/workstation/webpack.config.js",
  ];

  for (const configPath of possibleConfigLocations) {
    if (fs.existsSync(configPath)) {
      console.log(`Found webpack config at ${configPath}`);
      modifyWebpackConfig(configPath);
      return true;
    }
  }

  console.log("Could not find webpack config file to update");
  return false;
}

function modifyWebpackConfig(configPath) {
  let content = fs.readFileSync(configPath, "utf8");

  // Check if the config already has our fallback mechanism
  if (content.includes("fallbackServer")) {
    console.log("Webpack config already has fallback proxy configured");
    return;
  }

  // Simple replacement to add fallback logic to proxy config
  if (content.includes("proxy:") && content.includes("http://localhost:8001")) {
    const updatedContent = content.replace(
      /(proxy:\s*{[^}]*?)('http:\/\/localhost:8001'|"http:\/\/localhost:8001")/g,
      "$1{\n" +
        "        target: $2,\n" +
        "        changeOrigin: true,\n" +
        "        onError: function(err, req, res) {\n" +
        "          console.log('Proxy error:', err);\n" +
        "          if (req.path === '/manifest.json') {\n" +
        "            res.writeHead(200, { 'Content-Type': 'application/json' });\n" +
        "            res.end(JSON.stringify(" +
        JSON.stringify(defaultManifest) +
        "));\n" +
        "          } else {\n" +
        "            res.writeHead(502);\n" +
        "            res.end('Proxy error: ' + err);\n" +
        "          }\n" +
        "        }"
    );

    fs.writeFileSync(configPath, updatedContent);
    console.log("Updated webpack proxy configuration");
  } else {
    console.log("Could not find proxy configuration to update");
  }
}

// Main function
async function main() {
  // Try to check if a manifest.json file exists locally that we can use
  const manifestPaths = [
    "/workspaces/orpheus-engine/public/manifest.json",
    "/workspaces/orpheus-engine/OEW-main/public/manifest.json",
    "/workspaces/orpheus-engine/orpheus-engine-workstation/public/manifest.json",
  ];

  let localManifestFound = false;
  for (const manifestPath of manifestPaths) {
    if (fs.existsSync(manifestPath)) {
      console.log(`Found local manifest at ${manifestPath}`);
      localManifestFound = true;
      break;
    }
  }

  if (!localManifestFound) {
    // Create a local manifest.json file
    const publicDirs = [
      "/workspaces/orpheus-engine/public",
      "/workspaces/orpheus-engine/OEW-main/public",
      "/workspaces/orpheus-engine/orpheus-engine-workstation/public",
    ];

    for (const dir of publicDirs) {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(
          path.join(dir, "manifest.json"),
          JSON.stringify(defaultManifest, null, 2)
        );
        console.log(`Created manifest.json in ${dir}`);
        break;
      }
    }
  }

  // Update webpack config
  updateWebpackConfig();

  // Create fallback server
  const fallbackServer = createFallbackServer(8001, 8001);

  // Try to start the target service (placeholder - adjust as needed)
  // const targetService = startTargetService(8001, 'node', ['server.js']);

  console.log(
    "Proxy fallback setup complete. The application will now serve a default manifest.json when needed."
  );
  console.log(
    "If you want to properly fix this error, please ensure your service on port 8001 is running."
  );
}

main().catch(console.error);
