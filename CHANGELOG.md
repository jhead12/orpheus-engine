## [1.0.12](https://github.com/jhead12/orpheus-engine/compare/v1.0.8...v1.0.12) (2025-05-28)



## [1.0.11] - 2025-05-29

### Changed
- Updated user submodules to latest versions


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

### Added
- Advanced audio analysis using Python scientific libraries
- Integration with librosa for MFCC, spectral contrast, and chromagram analysis
- NumPy data export for research purposes
- Statistical analysis computed in Python
- New dependencies: librosa, scipy, numpy, soundfile

### Changed
- Enhanced AudioAnalysisPanel with Python-powered analysis features
- Improved data visualization for research use cases

## How to use the fixes
1. Run `npm run fix-vite` to install missing Vite dependencies
2. Run `npm run fix-electron-path` to fix the frontend directory path
3. Start the application with `yarn start`
