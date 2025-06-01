# Python Dependencies Fix for macOS

## Issue
The project was experiencing issues with Python dependencies on macOS, specifically:
- Tokenizers failing to build wheels
- Sentence-transformers installation problems
- Version conflicts between dependencies

## Solution
Created a macOS-specific dependency installation process that:
1. Uses pre-built wheels where possible
2. Installs specific versions known to work on macOS
3. Handles Rust installation (required for tokenizers)
4. Manages dependencies in the correct order

## Fixed Versions
- tokenizers: 0.15.0
- sentence-transformers: 2.2.2
- transformers: 4.35.2

## Implementation
- Created `scripts/fix-macos-dependencies.sh` for macOS-specific setup
- Updated `scripts/setup-python.js` to detect macOS and use appropriate installation method
- Uses `--no-build-isolation` flag for tokenizers to avoid compilation issues

## Usage
The fix is automatically applied when running:
```bash
npm run setup-python
```

## Manual Fix (if needed)
You can manually run the fix with:
```bash
./scripts/fix-macos-dependencies.sh
```

## Verification
After installation, verify with:
```python
import tokenizers
import sentence_transformers
import transformers

print(f"Tokenizers version: {tokenizers.__version__}")
print(f"Sentence-transformers version: {sentence_transformers.__version__}")
print(f"Transformers version: {transformers.__version__}")
```
