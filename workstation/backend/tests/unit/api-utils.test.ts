import { describe, it, expect } from 'vitest';
import { formatStatusResponse, validateApiVersion } from '../../src/utils/api.js';

describe('API Utilities', () => {
  describe('formatStatusResponse', () => {
    it('should format status response correctly', () => {
      const response = formatStatusResponse('test-service', '1.0.0');
      
      expect(response).toEqual({
        status: 'running',
        service: 'test-service',
        version: '1.0.0'
      });
    });
  });

  describe('validateApiVersion', () => {
    it('should validate version string correctly', () => {
      expect(validateApiVersion('1.0.0')).toBe(true);
      expect(validateApiVersion('invalid')).toBe(false);
    });
  });
});
