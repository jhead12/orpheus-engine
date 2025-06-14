# Resolving Package Installation Infinite Loop

## The Problem

The Orpheus Engine project previously had an issue with infinite loops during installation. This occurred due to a circular dependency in the npm scripts:

1. When running `npm install`, the `postinstall` script would run automatically
2. The `postinstall` script would call `node scripts/install-all.js`
3. The `install-all.js` script would install dependencies in the root and subdirectories
4. When these package managers ran, they would trigger their own `postinstall` hooks
5. This created an infinite loop

## The Solution

We implemented a multi-layered approach to prevent infinite loops during installation:

### 1. Recursion Detection

Created a utility (`prevent-recursion.js`) that:
- Creates a lock file during installation to detect recursion
- Checks for the presence of the lock file before starting installation
- Prevents installation if a recent lock file exists (indicating recursion)
- Handles stale lock files (older than 5 minutes)

### 2. Safer Postinstall Script

Created a safer `postinstall.js` script that:
- Uses recursion detection to avoid infinite loops
- Only performs essential operations (fixing permissions)
- Doesn't run package installations recursively
- Always cleans up lock files when done

### 3. Installation Wrapper

Created an `install-all-wrapper.js` that:
- Wraps the original installation script with recursion protection
- Prevents running installations within installations
- Ensures lock files are properly cleaned up

### 4. Environment Variables

Modified `runCommand` in `install-all.js` to:
- Set an environment variable `SKIP_POSTINSTALL=1` when running child processes
- This signals to npm/yarn/pnpm to skip postinstall hooks in child processes

## Usage

The installation process now works as follows:

1. **Initial Installation**: `npm install`
   - This runs a minimal `postinstall` script that only fixes permissions
   - No dependency installation is performed in subdirectories

2. **Full Installation**: `npm run install:all`
   - This runs the full installation process with recursion protection
   - Installs dependencies in all directories
   - Installs Python dependencies

## Troubleshooting

If you encounter installation issues:

1. **Delete Lock File**: If you need to force an installation:
   ```bash
   rm -f .install_lock && npm run install:all
   ```

2. **Manual Installation**: You can also install dependencies manually in each directory:
   ```bash
   npm install
   cd workstation/frontend && npm install
   cd ../backend && npm install
   # etc.
   ```

3. **Check Logs**: If installation fails, check for error messages indicating why.

## Why This Approach Works

This solution:
- Prevents infinite loops by detecting recursion
- Separates the minimal `postinstall` from the full installation process
- Uses environment variables to prevent nested postinstall hooks
- Provides proper cleanup to avoid lock files blocking future installations
