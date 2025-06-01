## [1.0.15](https://github.com/jhead12/orpheus-engine/compare/v1.0.11...v1.0.15) (2025-06-01)


### Bug Fixes

* resolve merge conflicts in App.tsx ([7b01ffd](https://github.com/jhead12/orpheus-engine/commit/7b01ffdf785e00953d31de4b61fca576fe14a4ce))
* resolve merge conflicts in types.ts and improve TimelinePosition class ([edfeaf8](https://github.com/jhead12/orpheus-engine/commit/edfeaf8c4a43e358576023c525cca344977c6ced))
* resolve tokenizers compilation issues for Python 3.12 ([6593aba](https://github.com/jhead12/orpheus-engine/commit/6593abae54c38dcd2a04bea4a2df50dff81d3a71))
* update workspace paths from orpheus-engine-workstation to workstation ([7367f10](https://github.com/jhead12/orpheus-engine/commit/7367f1075cbfb5a844aa795173fe4ba57a771515))


### Features

* **audio:** implement audio exporting and recording features ([6e4e4d1](https://github.com/jhead12/orpheus-engine/commit/6e4e4d1195113c3dc2fa2a379c76b15d92a42496))



## [1.0.14](https://github.com/jhead12/orpheus-engine/compare/v1.0.13...v1.0.14) (2025-05-28)



## [1.0.12](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.12) (2025-05-28)



## [1.0.11](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.11) (2025-05-28)



## [1.0.10](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.10) (2025-05-28)



## [1.0.9](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.9) (2025-05-28)



## [1.0.9](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.9) (2025-05-28)



## [1.0.9](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.9) (2025-05-28)



## [1.0.9](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.9) (2025-05-28)



## [1.0.7](https://github.com/jhead12/orpheus-engine/compare/v1.0.6...v1.0.7) (2025-05-27)


### Features

* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))



## [1.0.4](https://github.com/jhead12/orpheus-engine/compare/v1.0.6...v1.0.4) (2025-05-27)


### Features

* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))



# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2025-05-26

### Added
- Enhanced release management scripts
- Improved version synchronization across workspaces
- Release branch automation in package.json scripts
- Better dependency management with resolution declarations

### Changed
- Updated package.json with improved release workflow
- Enhanced sync-versions script with patch increment logic
- Streamlined build and development processes
- Improved workspace configuration

### Fixed
- Package version consistency across frontend and backend
- Release branch creation automation
- Development environment stability

## [1.0.5] - 2025-05-26

### Added
- Comprehensive test suite for frontend and backend
- Support component with Patreon integration
- Test coverage reporting
- Automated version syncing across packages

### Changed
- Improved development server configuration
- Enhanced logging system
- Updated package dependencies

### Fixed
- SQLite version compatibility issues
- Chrome extension resource loading warnings
- Development server configuration

## [1.0.0] - Initial Release

### Added
- Initial DAW functionality
- Audio processing capabilities
- RAG pipeline integration
- Python and TypeScript backend services
- React-based frontend interface

## [Unreleased]

### Fixed
- Fixed Vite server startup failure by adding missing `@vitejs/plugin-react` dependency
- Fixed directory path in `start-electron.sh` script that was causing navigation errors
- Added utility scripts (`fix-vite` and `fix-electron-path`) to automatically resolve these issues

### Added
- New npm scripts in package.json:
  - `fix-vite`: Installs missing Vite dependencies
  - `fix-electron-path`: Updates the frontend directory path in start-electron.sh

## How to use the fixes
1. Run `npm run fix-vite` to install missing Vite dependencies
2. Run `npm run fix-electron-path` to fix the frontend directory path
3. Start the application with `yarn start`
