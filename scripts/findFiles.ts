import fs from "fs";
import path from "path";

const EXCLUDED_DIRS = ["node_modules", ".git", "dist", "coverage"];
const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

interface FindFilesOptions {
  extensions?: string[];
  exclude?: string[];
}

function findFiles(
  startPath: string,
  options: FindFilesOptions = {}
): string[] {
  const files: string[] = [];
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const excludeDirs = [...EXCLUDED_DIRS, ...(options.exclude || [])];

  function scan(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scan(startPath);
  return files;
}

// When run directly
if (require.main === module) {
  const projectRoot = path.resolve(__dirname, "..");
  const files = findFiles(projectRoot);

  console.log("Found files:");
  files.forEach((file) => {
    console.log(path.relative(projectRoot, file));
  });
  console.log(`\nTotal files: ${files.length}`);
}

export default findFiles;
