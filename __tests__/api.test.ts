/**
 * Tests for API client utilities
 *
 * Tests the apiRequest retry/timeout logic via the exported API wrappers
 */

// Mock supabase before importing api
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: { access_token: 'test-token' },
        },
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user1', email: 'test@test.com' } },
      }),
    },
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { groupsApi, expensesApi } from '../lib/split4us/api';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('API Client', () => {
  describe('successful requests', () => {
    it('should return data on 200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: '1', name: 'Test Group' }]),
      });

      const result = await groupsApi.getAll();
      expect(result.data).toEqual([{ id: '1', name: 'Test Group' }]);
      expect(result.error).toBeUndefined();
    });

    it('should send auth header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await groupsApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('no body')),
      });

      const result = await expensesApi.delete('expense-1');
      expect(result.error).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should return error on 4xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Group not found' }),
      });

      const result = await groupsApi.getById('nonexistent');
      expect(result.error).toBe('Group not found');
      expect(result.status).toBe(404);
    });

    it('should return 401 when no session', async () => {
      const { supabase } = require('../lib/supabase');
      supabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      const result = await groupsApi.getAll();
      expect(result.error).toBe('Not authenticated');
      expect(result.status).toBe(401);
    });
  });

  describe('retry logic', () => {
    it('should retry on 500 errors', async () => {
      // First call: 500, retry: 200
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([{ id: '1' }]),
        });

      const result = await groupsApi.getAll();
      expect(result.data).toEqual([{ id: '1' }]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid input' }),
      });

      const result = await groupsApi.create({ name: '', currency: 'SEK' });
      expect(result.error).toBe('Invalid input');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
