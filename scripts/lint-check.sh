#!/bin/bash

# Script to run ESLint on the codebase and generate a report
# This helps in systematically addressing TypeScript and ESLint issues

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Directory to save reports
REPORTS_DIR="./lint-reports"
mkdir -p $REPORTS_DIR

# Current timestamp for report naming
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
REPORT_FILE="$REPORTS_DIR/eslint-report-$TIMESTAMP.txt"
SUMMARY_FILE="$REPORTS_DIR/eslint-summary-$TIMESTAMP.txt"
STATS_FILE="$REPORTS_DIR/eslint-stats-$TIMESTAMP.json"

echo -e "${BLUE}Running ESLint check on the codebase...${RESET}"
echo -e "${YELLOW}This may take a few minutes for a complete analysis.${RESET}"
echo ""

# Run ESLint with detailed output
npx eslint --ext .ts,.tsx,.js,.jsx ./src --output-file $REPORT_FILE

# Check if ESLint found any issues
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ No ESLint issues found!${RESET}"
  echo "No issues found" > $REPORT_FILE
  echo "ISSUE CATEGORIES: 0" > $SUMMARY_FILE
  echo "{\"total\":0,\"categories\":{}}" > $STATS_FILE
  exit 0
fi

echo -e "${YELLOW}ESLint found issues. Generating summary report...${RESET}"

# Extract statistics on different types of issues
echo "ISSUE SUMMARY" > $SUMMARY_FILE
echo "=============" >> $SUMMARY_FILE
echo "" >> $SUMMARY_FILE

# Count non-null assertions
NON_NULL_COUNT=$(grep -c "non-null" $REPORT_FILE)
echo "1. Non-null assertions (!): $NON_NULL_COUNT occurrences" >> $SUMMARY_FILE

# Count missing hook dependencies
HOOK_DEP_COUNT=$(grep -c "react-hooks/exhaustive-deps" $REPORT_FILE)
echo "2. Missing hook dependencies: $HOOK_DEP_COUNT occurrences" >> $SUMMARY_FILE

# Count implicit any types
ANY_TYPE_COUNT=$(grep -c "no-explicit-any\|explicit-module-boundary-types" $REPORT_FILE)
echo "3. Implicit 'any' types: $ANY_TYPE_COUNT occurrences" >> $SUMMARY_FILE

# Count unused variables
UNUSED_COUNT=$(grep -c "no-unused-vars" $REPORT_FILE)
echo "4. Unused variables and imports: $UNUSED_COUNT occurrences" >> $SUMMARY_FILE

# Count console statements
CONSOLE_COUNT=$(grep -c "no-console" $REPORT_FILE)
echo "5. Console statements: $CONSOLE_COUNT occurrences" >> $SUMMARY_FILE

# Count require statements
REQUIRE_COUNT=$(grep -c "import/no-commonjs\|@typescript-eslint/no-require-imports" $REPORT_FILE)
echo "6. CommonJS requires: $REQUIRE_COUNT occurrences" >> $SUMMARY_FILE

# Count all other issues
TOTAL_ISSUES=$(grep -c "error\|warning" $REPORT_FILE)
OTHER_ISSUES=$((TOTAL_ISSUES - NON_NULL_COUNT - HOOK_DEP_COUNT - ANY_TYPE_COUNT - UNUSED_COUNT - CONSOLE_COUNT - REQUIRE_COUNT))
echo "7. Other issues: $OTHER_ISSUES occurrences" >> $SUMMARY_FILE

echo "" >> $SUMMARY_FILE
echo "TOTAL ISSUES: $TOTAL_ISSUES" >> $SUMMARY_FILE
echo "" >> $SUMMARY_FILE

# Create JSON stats for potential visualization
echo "{
  \"total\": $TOTAL_ISSUES,
  \"categories\": {
    \"nonNullAssertions\": $NON_NULL_COUNT,
    \"missingHookDeps\": $HOOK_DEP_COUNT,
    \"implicitAnyTypes\": $ANY_TYPE_COUNT,
    \"unusedVars\": $UNUSED_COUNT,
    \"consoleStatements\": $CONSOLE_COUNT,
    \"commonJSRequires\": $REQUIRE_COUNT,
    \"otherIssues\": $OTHER_ISSUES
  }
}" > $STATS_FILE

# Print summary to terminal
echo -e "${BLUE}=== ESLint Issue Summary ===${RESET}"
echo -e "${YELLOW}Non-null assertions (!):${RESET} $NON_NULL_COUNT"
echo -e "${YELLOW}Missing hook dependencies:${RESET} $HOOK_DEP_COUNT"
echo -e "${YELLOW}Implicit 'any' types:${RESET} $ANY_TYPE_COUNT"
echo -e "${YELLOW}Unused variables/imports:${RESET} $UNUSED_COUNT"
echo -e "${YELLOW}Console statements:${RESET} $CONSOLE_COUNT"
echo -e "${YELLOW}CommonJS requires:${RESET} $REQUIRE_COUNT"
echo -e "${YELLOW}Other issues:${RESET} $OTHER_ISSUES"
echo -e "${RED}TOTAL ISSUES: $TOTAL_ISSUES${RESET}"
echo ""

echo -e "Detailed report saved to: ${BLUE}$REPORT_FILE${RESET}"
echo -e "Summary report saved to: ${BLUE}$SUMMARY_FILE${RESET}"
echo -e "Statistics saved to: ${BLUE}$STATS_FILE${RESET}"

# Provide guidance on next steps
echo ""
echo -e "${GREEN}==== Next Steps ====${RESET}"
echo "1. Review the detailed report for specific issues"
echo "2. Address high-priority issues first (non-null assertions, hook dependencies)"
echo "3. Update the progress tracking table in UI_ENHANCEMENT_PROGRESS.md"
echo "4. Run this script again to measure progress"
echo ""
echo -e "${YELLOW}To fix common issues automatically:${RESET}"
echo "npx eslint --ext .ts,.tsx,.js,.jsx ./src --fix"
