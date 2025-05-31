## 0.0.0 (2025-05-30)

* Fixed: "vite: not found" error in headless mode by using local node_modules path
* Added: Automatic detection and installation of missing Vite package
* Added: Fix script to ensure Vite is properly installed and available in PATH

## 0.0.0 (2025-05-29)

* Fixed: Vite server startup issues with improved error handling and diagnostics
* Added: Automatic port conflict resolution for Vite server
* Added: Diagnostic script to troubleshoot Vite startup problems
* Improved: Development server startup process with better feedback and progress indication

* Fixed: Proxy error for manifest.json by adding a fallback mechanism
* Added: Automatic fallback response for manifest.json when backend service is unavailable
* Added: New script `dev:proxy-fix` to start with proxy fallback enabled

## 0.0.0 (2025-05-28)

* Fixed: X11 display errors by adding automatic detection and virtual framebuffer setup
* Added: Support for running Electron in containerized environments without X server
* Added: Fallback to headless mode when X11 is not available

## 0.0.0 (2025-05-27)

* update ([02da30e](https://github.com/sirgawain0x/orpheus-engine/commit/02da30e))
* updates ([b15c111](https://github.com/sirgawain0x/orpheus-engine/commit/b15c111))
* warning: refname main is ambiguous. ([2c831e1](https://github.com/sirgawain0x/orpheus-engine/commit/2c831e1))
* Fix: Resolve ipcRenderer error in WorkstationProvider ([1cb43e5](https://github.com/sirgawain0x/orpheus-engine/commit/1cb43e5))
* feat: implement complete Electron integration ([29cf709](https://github.com/sirgawain0x/orpheus-engine/commit/29cf709))

* Fix: WindowAutoScroll component fixes
  - Fixed a TypeScript error where the `thresholds` prop could be a number or an array of objects, but the code assumed it was always an array.
  - Improved code readability by replacing nested ternary operators with `if/else if/else` statements.
  - Fixed a bug where the component would scroll in the wrong direction when the scroll amount was negative.



