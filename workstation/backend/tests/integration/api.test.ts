import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/server.js';

const request = supertest(app);

describe('API Integration Tests', () => {
  describe('Health Check Endpoint', () => {
    it('should return 200 and correct status format', async () => {
      const response = await request.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'ok',
        service: 'daw',
        timestamp: expect.any(String)
      }));
    });
  });

  describe('API Status Endpoint', () => {
    it('should return correct service information', async () => {
      const response = await request.get('/api/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: 'running',
        service: 'daw-backend',
        version: expect.any(String)
      }));
    });
  });
});
