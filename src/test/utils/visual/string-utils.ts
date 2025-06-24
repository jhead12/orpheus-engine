/**
 * Escape special characters in a string for use in template literals
 */
export function escapeTemplateString(str: string) {
  return str.replace(/\${/g, '\\${');
}

/**
 * Join lines with newlines filtering out empty lines
 */
export function joinLines(lines: string[]) {
  return lines.filter(Boolean).join('\n');
}

/**
 * Indent a block of code with a specified number of spaces
 */
export function indentCode(code: string, spaces = 2) {
  const indent = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');
}
