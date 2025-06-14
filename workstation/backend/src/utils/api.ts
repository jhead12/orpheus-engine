/**
 * Format the standard status response object
 */
export function formatStatusResponse(serviceName: string, version: string) {
  return {
    status: 'running',
    service: serviceName,
    version
  };
}

/**
 * Validate API version string format (semver)
 */
export function validateApiVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}
