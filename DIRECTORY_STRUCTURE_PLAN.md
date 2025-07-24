# Orpheus Engine - Directory Structure Reorganization Plan

## Current Structure Issues

- Mixed frontend/backend code
- Documentation scattered
- No clear separation between core modules and features
- Inconsistent naming conventions

## New Structure (HP AI Studio Blueprints Compatible)

```
# Root Directory
├── audio-workstation/               # Main category for DAW features
│   │
│   ├── daw-core/                    # Core DAW functionality
│   │   ├── configs/                 # Configuration files
│   │   │   ├── audio-settings.yaml  # Default audio settings
│   │   │   ├── ui-settings.yaml     # UI preferences
│   │   │   └── secrets.yaml.example # Template for API keys (gitignored)
│   │   ├── data/                    # Sample audio files for testing
│   │   ├── demo/                    # Current 'demo' folder contents
│   │   ├── docs/                    # DAW documentation
│   │   │   ├── installation_guide.md
│   │   │   ├── architecture.md
│   │   │   └── user_manual.md
│   │   ├── src/                     # Core DAW source code
│   │   │   ├── __init__.py
│   │   │   ├── audio/               # Audio processing modules
│   │   │   ├── ui/                  # UI components
│   │   │   └── utils/               # Utilities
│   │   ├── tests/                   # Unit and integration tests
│   │   ├── .gitignore
│   │   ├── requirements.txt         # Python dependencies
│   │   └── README.md
│   │
│   ├── ai-features/                 # AI-enhanced features
│       ├── configs/
│       ├── data/                    # Training data and models
│       ├── notebooks/               # Analysis notebooks
│       ├── src/                     # AI feature implementation
│       │   ├── __init__.py
│       │   ├── ml_models/           # Machine learning models
│       │   └── audio_analysis/      # Audio analysis tools
│       ├── tests/
│       ├── requirements.txt
│       └── README.md
│
├── electron-app/                    # Electron application wrapper
│   ├── configs/
│   ├── src/
│   ├── build/                       # Build output
│   └── README.md
│
├── workstation/                     # Complete workstation UI
│   ├── configs/
│   ├── frontend/
│   │   ├── src/
│   │   └── public/
│   ├── backend/
│   ├── tests/
│   └── README.md
│
├── docs/                            # Project-wide documentation
│   ├── architecture/
│   ├── dev-guides/
│   ├── user-guides/
│   └── api/
│
├── scripts/                         # Development and deployment scripts
│
├── .github/                         # GitHub workflows and templates
│
├── .gitignore
├── LICENSE
├── README.md                        # Main project README
└── requirements.txt                 # Top-level dependencies
```

## Migration Strategy

1. **Phase 1: Documentation Reorganization**

   - Move all documentation to the `/docs` folder
   - Create standard README templates
   - Update installation guides

2. **Phase 2: Source Code Reorganization**

   - Separate core DAW functionality from AI features
   - Restructure the source directories
   - Update import statements

3. **Phase 3: Configuration Standardization**

   - Create standard configuration files
   - Separate sensitive information

4. **Phase 4: Test Suite Organization**
   - Reorganize tests to match new structure
   - Ensure all tests pass after restructuring

## Implementation Timeline

- **Week 1**: Documentation and planning
- **Week 2**: Core structure implementation
- **Week 3**: Code migration and testing
- **Week 4**: Verification and cleanup

## Benefits

- ✅ Better organization and maintainability
- ✅ Clear separation of concerns
- ✅ Standardized configuration management
- ✅ Improved developer experience
- ✅ HP AI Studio compatibility
