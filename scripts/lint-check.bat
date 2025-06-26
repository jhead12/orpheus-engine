@echo off
echo Running ESLint check on the codebase...
echo This may take a few minutes for a complete analysis.
echo.

:: Directory to save reports
if not exist ".\lint-reports" mkdir ".\lint-reports"

:: Current timestamp for report naming
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%-%dt:~8,6%"
set "REPORT_FILE=.\lint-reports\eslint-report-%TIMESTAMP%.txt"
set "SUMMARY_FILE=.\lint-reports\eslint-summary-%TIMESTAMP%.txt"
set "STATS_FILE=.\lint-reports\eslint-stats-%TIMESTAMP%.json"

:: Run ESLint with detailed output
call npx eslint --ext .ts,.tsx,.js,.jsx ./src --output-file "%REPORT_FILE%"

echo.
echo Detailed report saved to: %REPORT_FILE%
echo.

:: Provide guidance on next steps
echo === Next Steps ===
echo 1. Review the detailed report for specific issues
echo 2. Address high-priority issues first (non-null assertions, hook dependencies)
echo 3. Update the progress tracking table in UI_ENHANCEMENT_PROGRESS.md
echo 4. Run this script again to measure progress
echo.
echo To fix common issues automatically:
echo npx eslint --ext .ts,.tsx,.js,.jsx ./src --fix
