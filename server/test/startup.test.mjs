import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);

describe('server startup helpers', () => {
  afterEach(() => {
    delete process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES;
    delete process.env.MONGO_TLS_ALLOW_INVALID_HOSTNAMES;
    delete process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS;
    vi.restoreAllMocks();
  });

  it('builds mongoose options from the mongo tls environment flags', () => {
    process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES = 'true';
    process.env.MONGO_TLS_ALLOW_INVALID_HOSTNAMES = 'true';
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = '15000';

    const { buildMongoOptions } = require('../config/db');

    expect(buildMongoOptions()).toEqual({
      serverSelectionTimeoutMS: 15000,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });
  });

  it('waits for the database connection before starting the http listener', async () => {
    const { startServer } = require('../bootstrap');
    const listen = vi.fn(() => {
      const listeners = new Map();

      return {
        once: vi.fn((event, handler) => {
          listeners.set(event, handler);
          if (event === 'listening') {
            handler();
          }
        }),
      };
    });

    const app = { listen };
    const connectDB = vi.fn(async () => {});

    await startServer({ app, connectDB, port: 5000, logger: { log: vi.fn() } });

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledTimes(1);
    expect(connectDB.mock.invocationCallOrder[0]).toBeLessThan(listen.mock.invocationCallOrder[0]);
  });
});
