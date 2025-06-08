import { readdir, stat } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function listScreenshots() {
  const screenshotsDir = join(__dirname, "..", "__snapshots__", "screenshots");
  const diffsDir = join(__dirname, "..", "__snapshots__", "diffs");

  try {
    // Read screenshots directory
    const screenshots = await readdir(screenshotsDir);
    const diffs = await readdir(diffsDir);

    // Get file stats for all screenshots
    const screenshotStats = await Promise.all(
      screenshots.map(async (file) => ({
        name: file,
        stats: await stat(join(screenshotsDir, file)),
      }))
    );

    // Sort by creation time, newest first
    screenshotStats.sort((a, b) => b.stats.ctimeMs - a.stats.ctimeMs);

    console.log("\n\x1b[1;34m=== Screenshot Test Results ===\x1b[0m\n");

    if (screenshotStats.length > 0) {
      console.log("\x1b[1;32m✓ Test Screenshots (newest first):\x1b[0m");
      screenshotStats.forEach(({ name, stats }) => {
        const timeStr = stats.ctime.toLocaleString();
        const filePath = join(screenshotsDir, name);
        // Print filename and timestamp
        console.log(`  📸 ${name} (${timeStr})`);
        // Print VS Code and image viewer links
        console.log(
          `     \x1b[34m→ Edit: \x1b]8;;vscode://file${filePath}\x1b\\Open in VS Code\x1b]8;;\x1b\\`
        );
        console.log(
          `     → View: \x1b]8;;file://${filePath}\x1b\\Open in Image Viewer\x1b]8;;\x1b\\\x1b[0m`
        );
      });
    } else {
      console.log("\x1b[1;33mℹ No screenshots found from passing tests\x1b[0m");
    }

    if (diffs.length > 0) {
      console.log("\n\x1b[1;33m⚠ Difference Images:\x1b[0m");
      diffs.forEach((file) => {
        const filePath = join(diffsDir, file);
        console.log(`  🔍 ${file}`);
        console.log(
          `     \x1b[34m→ Edit: \x1b]8;;vscode://file${filePath}\x1b\\Open in VS Code\x1b]8;;\x1b\\`
        );
        console.log(
          `     → View: \x1b]8;;file://${filePath}\x1b\\Open in Image Viewer\x1b]8;;\x1b\\\x1b[0m`
        );
      });
    }

    console.log("\n\x1b[1;34m=============================\x1b[0m\n");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("\x1b[1;33mNo screenshots found. Run tests first.\x1b[0m");
    } else {
      console.error("Error:", error);
    }
  }
}

listScreenshots();
