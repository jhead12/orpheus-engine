## [1.0.17](https://github.com/jhead12/orpheus-engine/compare/v2.0.0-alpha.1...v1.0.17) (2025-06-04)


### Bug Fixes

* update release:prepare script to merge from typescript-compilation-fixes ([c485b1c](https://github.com/jhead12/orpheus-engine/commit/c485b1c7d823854eb76e6f52180e61cb353138bc))
* update sync-versions script to use root version and remove incorrect paths ([d1f635c](https://github.com/jhead12/orpheus-engine/commit/d1f635ca2e3565a7f114ad3b52e3787c3259ac6e))
* update tokenizers and dependencies to prevent build errors on macOS ([8c88293](https://github.com/jhead12/orpheus-engine/commit/8c88293fcd7f52d576cc2c90d29b64a9045209b0))


### Features

* add ESLint configuration and update dependencies; refactor variable declarations to use const ([645bc00](https://github.com/jhead12/orpheus-engine/commit/645bc00be2fe28ff6cd8557f840c7368a77caf24))
* Add fix-python-deps script and update dependencies in requirements.txt ([15055f2](https://github.com/jhead12/orpheus-engine/commit/15055f2433df18fa8815c08d58a7ed8813333921))
* add Lane, SidePanel, and SidePanel.test components ([53084aa](https://github.com/jhead12/orpheus-engine/commit/53084aa2358cdceb075a3701be0df6f6b116b1e5))
* Add macOS-specific Python dependency fixes ([0460271](https://github.com/jhead12/orpheus-engine/commit/0460271a29dc16bf49fa4ff61f55c24c80a74fc6))
* **audio-input:** add NRFAudioInputPlugin and USBAudioInputPlugin for wireless and USB audio interfaces ([ca9cfb0](https://github.com/jhead12/orpheus-engine/commit/ca9cfb04937ce2dce195aac88b5d0af02bc95992))
* **audio-recorder:** enhance audio clip creation and waveform drawing logic ([d0259bc](https://github.com/jhead12/orpheus-engine/commit/d0259bc6fd2aa56b2fc3cc1e9ed3fb2a9e7740c7))
* **audio-recorder:** update recording stop logic and improve error handling ([5dbe83f](https://github.com/jhead12/orpheus-engine/commit/5dbe83f00a5ba65459bf2b9dee8b9878528ac28a))
* Enhance PreferencesContext with color scheme and custom color adjustments ([bbee97e](https://github.com/jhead12/orpheus-engine/commit/bbee97e9f5a37edc100a55ef8d43cca2028d1791))
* implement complete Electron integration ([1212fd3](https://github.com/jhead12/orpheus-engine/commit/1212fd3ec43f5f913f3ca33001e8d8994a413092))
* Implement comprehensive NPM dependency fixer script ([802b15f](https://github.com/jhead12/orpheus-engine/commit/802b15f0a72e53c18c02328a0d16b826f274cd9e))
* Implement Workstation component with header, timeline, track list, and mixer ([ad68728](https://github.com/jhead12/orpheus-engine/commit/ad6872874ca19772c9e704f10b3965aea5201a4e))
* Integrate comprehensive audio clip export functionality with multiple export options ([2ed68a6](https://github.com/jhead12/orpheus-engine/commit/2ed68a628b0d9233df42a3b36542e5e6e2a64002))
* **tests:** define MockProject interface for improved type safety in ProjectFileOperations tests ([cab64d6](https://github.com/jhead12/orpheus-engine/commit/cab64d6265edf55e7588436aa09dbe0cc7cb73f6))



## 1.0.17 (2025-06-04)


### Bug Fixes

* resolve merge conflicts in App.tsx ([7b01ffd](https://github.com/jhead12/orpheus-engine/commit/7b01ffdf785e00953d31de4b61fca576fe14a4ce))
* resolve merge conflicts in types.ts and improve TimelinePosition class ([edfeaf8](https://github.com/jhead12/orpheus-engine/commit/edfeaf8c4a43e358576023c525cca344977c6ced))
* resolve tokenizers compilation issues for Python 3.12 ([6593aba](https://github.com/jhead12/orpheus-engine/commit/6593abae54c38dcd2a04bea4a2df50dff81d3a71))
* restore orpheus-engine-workstation submodule and remove invalid ffmpeg submodule reference ([77d267d](https://github.com/jhead12/orpheus-engine/commit/77d267d3c15948adb1c1722f30cdb73e3d360bf1))
* update release:prepare script to merge from typescript-compilation-fixes ([c485b1c](https://github.com/jhead12/orpheus-engine/commit/c485b1c7d823854eb76e6f52180e61cb353138bc))
* update sync-versions script to use root version and remove incorrect paths ([d1f635c](https://github.com/jhead12/orpheus-engine/commit/d1f635ca2e3565a7f114ad3b52e3787c3259ac6e))
* update tokenizers and dependencies to prevent build errors on macOS ([8c88293](https://github.com/jhead12/orpheus-engine/commit/8c88293fcd7f52d576cc2c90d29b64a9045209b0))
* update workspace paths from orpheus-engine-workstation to workstation ([7367f10](https://github.com/jhead12/orpheus-engine/commit/7367f1075cbfb5a844aa795173fe4ba57a771515))


### Features

* add ESLint configuration and update dependencies; refactor variable declarations to use const ([645bc00](https://github.com/jhead12/orpheus-engine/commit/645bc00be2fe28ff6cd8557f840c7368a77caf24))
* add Lane, SidePanel, and SidePanel.test components ([53084aa](https://github.com/jhead12/orpheus-engine/commit/53084aa2358cdceb075a3701be0df6f6b116b1e5))
* Add macOS-specific Python dependency fixes ([0460271](https://github.com/jhead12/orpheus-engine/commit/0460271a29dc16bf49fa4ff61f55c24c80a74fc6))
* **audio:** implement audio exporting and recording features ([6e4e4d1](https://github.com/jhead12/orpheus-engine/commit/6e4e4d1195113c3dc2fa2a379c76b15d92a42496))
* Enhance PreferencesContext with color scheme and custom color adjustments ([bbee97e](https://github.com/jhead12/orpheus-engine/commit/bbee97e9f5a37edc100a55ef8d43cca2028d1791))
* implement complete Electron integration ([1212fd3](https://github.com/jhead12/orpheus-engine/commit/1212fd3ec43f5f913f3ca33001e8d8994a413092))
* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))
* Implement Workstation component with header, timeline, track list, and mixer ([ad68728](https://github.com/jhead12/orpheus-engine/commit/ad6872874ca19772c9e704f10b3965aea5201a4e))
* Initial commit with orpheus-engine-workstation v1.0.5 ([144d012](https://github.com/jhead12/orpheus-engine/commit/144d012c9ea8fddf33eba5727af9aec44de98843))



## 1.0.17 (2025-06-03)


### Bug Fixes

* resolve merge conflicts in App.tsx ([7b01ffd](https://github.com/jhead12/orpheus-engine/commit/7b01ffdf785e00953d31de4b61fca576fe14a4ce))
* resolve merge conflicts in types.ts and improve TimelinePosition class ([edfeaf8](https://github.com/jhead12/orpheus-engine/commit/edfeaf8c4a43e358576023c525cca344977c6ced))
* resolve tokenizers compilation issues for Python 3.12 ([6593aba](https://github.com/jhead12/orpheus-engine/commit/6593abae54c38dcd2a04bea4a2df50dff81d3a71))
* restore orpheus-engine-workstation submodule and remove invalid ffmpeg submodule reference ([77d267d](https://github.com/jhead12/orpheus-engine/commit/77d267d3c15948adb1c1722f30cdb73e3d360bf1))
* update release:prepare script to merge from typescript-compilation-fixes ([c485b1c](https://github.com/jhead12/orpheus-engine/commit/c485b1c7d823854eb76e6f52180e61cb353138bc))
* update sync-versions script to use root version and remove incorrect paths ([d1f635c](https://github.com/jhead12/orpheus-engine/commit/d1f635ca2e3565a7f114ad3b52e3787c3259ac6e))
* update tokenizers and dependencies to prevent build errors on macOS ([8c88293](https://github.com/jhead12/orpheus-engine/commit/8c88293fcd7f52d576cc2c90d29b64a9045209b0))
* update workspace paths from orpheus-engine-workstation to workstation ([7367f10](https://github.com/jhead12/orpheus-engine/commit/7367f1075cbfb5a844aa795173fe4ba57a771515))


### Features

* add ESLint configuration and update dependencies; refactor variable declarations to use const ([645bc00](https://github.com/jhead12/orpheus-engine/commit/645bc00be2fe28ff6cd8557f840c7368a77caf24))
* add Lane, SidePanel, and SidePanel.test components ([53084aa](https://github.com/jhead12/orpheus-engine/commit/53084aa2358cdceb075a3701be0df6f6b116b1e5))
* Add macOS-specific Python dependency fixes ([0460271](https://github.com/jhead12/orpheus-engine/commit/0460271a29dc16bf49fa4ff61f55c24c80a74fc6))
* **audio:** implement audio exporting and recording features ([6e4e4d1](https://github.com/jhead12/orpheus-engine/commit/6e4e4d1195113c3dc2fa2a379c76b15d92a42496))
* implement complete Electron integration ([1212fd3](https://github.com/jhead12/orpheus-engine/commit/1212fd3ec43f5f913f3ca33001e8d8994a413092))
* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))
* Initial commit with orpheus-engine-workstation v1.0.5 ([144d012](https://github.com/jhead12/orpheus-engine/commit/144d012c9ea8fddf33eba5727af9aec44de98843))



## 1.0.17 (2025-06-02)


### Bug Fixes

* resolve merge conflicts in App.tsx ([7b01ffd](https://github.com/jhead12/orpheus-engine/commit/7b01ffdf785e00953d31de4b61fca576fe14a4ce))
* resolve merge conflicts in types.ts and improve TimelinePosition class ([edfeaf8](https://github.com/jhead12/orpheus-engine/commit/edfeaf8c4a43e358576023c525cca344977c6ced))
* resolve tokenizers compilation issues for Python 3.12 ([6593aba](https://github.com/jhead12/orpheus-engine/commit/6593abae54c38dcd2a04bea4a2df50dff81d3a71))
* restore orpheus-engine-workstation submodule and remove invalid ffmpeg submodule reference ([77d267d](https://github.com/jhead12/orpheus-engine/commit/77d267d3c15948adb1c1722f30cdb73e3d360bf1))
* update workspace paths from orpheus-engine-workstation to workstation ([7367f10](https://github.com/jhead12/orpheus-engine/commit/7367f1075cbfb5a844aa795173fe4ba57a771515))


### Features

* **audio:** implement audio exporting and recording features ([6e4e4d1](https://github.com/jhead12/orpheus-engine/commit/6e4e4d1195113c3dc2fa2a379c76b15d92a42496))
* implement complete Electron integration ([1212fd3](https://github.com/jhead12/orpheus-engine/commit/1212fd3ec43f5f913f3ca33001e8d8994a413092))
* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))
* Initial commit with orpheus-engine-workstation v1.0.5 ([144d012](https://github.com/jhead12/orpheus-engine/commit/144d012c9ea8fddf33eba5727af9aec44de98843))



## 1.0.16 (2025-06-02)


### Bug Fixes

* resolve merge conflicts in App.tsx ([7b01ffd](https://github.com/jhead12/orpheus-engine/commit/7b01ffdf785e00953d31de4b61fca576fe14a4ce))
* resolve merge conflicts in types.ts and improve TimelinePosition class ([edfeaf8](https://github.com/jhead12/orpheus-engine/commit/edfeaf8c4a43e358576023c525cca344977c6ced))
* resolve tokenizers compilation issues for Python 3.12 ([6593aba](https://github.com/jhead12/orpheus-engine/commit/6593abae54c38dcd2a04bea4a2df50dff81d3a71))
* restore orpheus-engine-workstation submodule and remove invalid ffmpeg submodule reference ([77d267d](https://github.com/jhead12/orpheus-engine/commit/77d267d3c15948adb1c1722f30cdb73e3d360bf1))
* update workspace paths from orpheus-engine-workstation to workstation ([7367f10](https://github.com/jhead12/orpheus-engine/commit/7367f1075cbfb5a844aa795173fe4ba57a771515))


### Features

* **audio:** implement audio exporting and recording features ([6e4e4d1](https://github.com/jhead12/orpheus-engine/commit/6e4e4d1195113c3dc2fa2a379c76b15d92a42496))
* implement complete Electron integration ([1212fd3](https://github.com/jhead12/orpheus-engine/commit/1212fd3ec43f5f913f3ca33001e8d8994a413092))
* implement complete Electron integration ([29cf709](https://github.com/jhead12/orpheus-engine/commit/29cf7097aecb2556491fe6e35a92c5c2c5c534cb))
* Initial commit with orpheus-engine-workstation v1.0.5 ([144d012](https://github.com/jhead12/orpheus-engine/commit/144d012c9ea8fddf33eba5727af9aec44de98843))



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
