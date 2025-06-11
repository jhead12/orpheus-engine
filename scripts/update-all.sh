#!/usr/bin/env bash

# Comprehensive Update Script for Orpheus Engine
# This script updates both the main repository and all submodules

set -e  # Exit on any error

# ANSI color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}🔄 Orpheus Engine Complete Update Script${NC}"
echo -e "${CYAN}This script will update both the main repository and all submodules${NC}\n"

# Function to print status messages
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the orpheus-engine root directory."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Stashing them temporarily..."
    git stash push -m "Auto-stash before update $(date)"
    STASHED=true
else
    STASHED=false
fi

echo -e "\n${BOLD}${CYAN}📡 Updating Main Repository${NC}"

# Fetch latest changes from origin
print_status "Fetching latest changes from origin..."
git fetch origin

# Pull latest changes for current branch
print_status "Pulling latest changes for branch '$CURRENT_BRANCH'..."
if git pull origin "$CURRENT_BRANCH"; then
    print_success "Main repository updated successfully"
else
    print_error "Failed to update main repository"
    exit 1
fi

echo -e "\n${BOLD}${CYAN}🔧 Updating Submodules${NC}"

# Initialize submodules if they haven't been initialized
print_status "Initializing submodules..."
if git submodule update --init --recursive; then
    print_success "Submodules initialized"
else
    print_warning "Some submodules may have failed to initialize"
fi

# Update all submodules to their latest remote versions
print_status "Updating all submodules to latest versions..."
if git submodule update --remote --recursive; then
    print_success "All submodules updated successfully"
else
    print_warning "Some submodules may have failed to update"
fi

# Show submodule status
echo -e "\n${BOLD}${CYAN}📊 Submodule Status${NC}"
git submodule status

# Check if there are any submodule changes to commit
if git diff --cached --quiet && git diff --quiet; then
    print_success "Repository is up to date - no changes to commit"
else
    echo -e "\n${BOLD}${CYAN}💾 Committing Submodule Updates${NC}"
    
    # Stage submodule changes
    git add .
    
    # Create commit message with timestamp
    COMMIT_MSG="Update submodules to latest versions - $(date '+%Y-%m-%d %H:%M:%S')"
    
    print_status "Committing changes: $COMMIT_MSG"
    if git commit -m "$COMMIT_MSG"; then
        print_success "Submodule updates committed successfully"
        
        # Ask if user wants to push changes
        echo -e "\n${YELLOW}Do you want to push the changes to origin/$CURRENT_BRANCH? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            if git push origin "$CURRENT_BRANCH"; then
                print_success "Changes pushed to origin/$CURRENT_BRANCH"
            else
                print_error "Failed to push changes"
            fi
        else
            print_warning "Changes committed locally but not pushed"
        fi
    else
        print_error "Failed to commit submodule updates"
    fi
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo -e "\n${BOLD}${CYAN}🔄 Restoring Stashed Changes${NC}"
    print_status "Restoring your uncommitted changes..."
    if git stash pop; then
        print_success "Stashed changes restored"
    else
        print_warning "Failed to restore stashed changes. Use 'git stash list' and 'git stash pop' manually."
    fi
fi

echo -e "\n${BOLD}${GREEN}🎉 Update Complete!${NC}"
echo -e "${GREEN}Main repository and all submodules have been updated.${NC}"

# Show git status
echo -e "\n${BOLD}${CYAN}📋 Current Git Status${NC}"
git status --short
