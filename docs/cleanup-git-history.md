# Cleaning Up Git Repository History

If you're still experiencing issues pushing to GitHub due to large files in the repository history, you can use the following steps to permanently remove them.

> ⚠️ **WARNING**: This will rewrite your git history. Make sure all team members are aware of this change before proceeding.

## Using Git Filter-Repo

1. Install git-filter-repo:
```bash
# macOS
brew install git-filter-repo
# or with pip
pip install git-filter-repo
```

2. Create a backup of your repository:
```bash
cp -r orpheus-engine orpheus-engine-backup
```

3. Remove large files from history:
```bash
# Remove specific large files
git filter-repo --path workstation/backend/models/llama-2-7b-chat.Q4_K_M.gguf --invert-paths

# Remove all .gguf files
git filter-repo --path-glob "*.gguf" --invert-paths

# Remove all archives
git filter-repo --path-glob "*.tar.gz" --invert-paths
git filter-repo --path-glob "*.zip" --invert-paths

# Remove chroma_db binary files
git filter-repo --path-glob "chroma_db/*/*.bin" --invert-paths
```

4. Force push the cleaned repository:
```bash
git push origin --force --all
git push origin --force --tags
```

5. Ask all collaborators to re-clone the repository:
```bash
git clone https://github.com/your-username/orpheus-engine.git
```

## Alternative: BFG Repo-Cleaner

If you prefer using BFG Repo-Cleaner:

1. Download the BFG jar file from https://rtyley.github.io/bfg-repo-cleaner/

2. Remove large files:
```bash
java -jar bfg.jar --strip-blobs-bigger-than 100M orpheus-engine
cd orpheus-engine
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

Remember, this process will rewrite history, so make sure all your team members are on board before proceeding.
