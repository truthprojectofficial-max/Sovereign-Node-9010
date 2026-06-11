import { describe, it, expect } from 'vitest';
import { tracingMiddleware, getTraceId, getTraceContext } from '../src/middleware/tracing';

// Minimal mock Express objects
function mockReq(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    method: 'GET',
    path: '/api/health',
    headers: {},
    ...overrides,
  };
}

function mockRes() {
  const headers: Record<string, string> = {};
  const res = {
    headers,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
  };
  return res;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Tracing Middleware', () => {
  it('should generate a UUID trace ID when no incoming header is present', () => {
    const req = mockReq();
    const res = mockRes();
    let capturedTraceId: string | undefined;

    tracingMiddleware(req as never, res as never, () => {
      capturedTraceId = getTraceId();
    });

    expect(capturedTraceId).toMatch(UUID_PATTERN);
    expect(res.headers['X-Trace-Id']).toBe(capturedTraceId);
  });

  it('should re-use an incoming X-Trace-Id header', () => {
    const existingId = 'abc-123-def';
    const req = mockReq({ headers: { 'x-trace-id': existingId } });
    const res = mockRes();
    let capturedTraceId: string | undefined;

    tracingMiddleware(req as never, res as never, () => {
      capturedTraceId = getTraceId();
    });

    expect(capturedTraceId).toBe(existingId);
    expect(res.headers['X-Trace-Id']).toBe(existingId);
  });

  it('should always call next()', () => {
    const req = mockReq();
    const res = mockRes();
    let called = false;

    tracingMiddleware(req as never, res as never, () => {
      called = true;
    });

    expect(called).toBe(true);
  });

  it('should record startTime in trace context', () => {
    const req = mockReq();
    const res = mockRes();
    const before = Date.now();
    let context: ReturnType<typeof getTraceContext>;

    tracingMiddleware(req as never, res as never, () => {
      context = getTraceContext();
    });

    expect(context).toBeDefined();
    expect(context!.startTime).toBeGreaterThanOrEqual(before);
    expect(context!.startTime).toBeLessThanOrEqual(Date.now());
  });

  it('should return "no-trace" when called outside a request context', () => {
    // Invoked outside any tracingMiddleware — should return the fallback value
    const id = getTraceId();
    expect(id).toBe('no-trace');
  });

  it('should return undefined from getTraceContext() outside a request context', () => {
    expect(getTraceContext()).toBeUndefined();
  });

  it('should isolate trace IDs between concurrent requests', async () => {
    const req1 = mockReq();
    const req2 = mockReq();
    const res1 = mockRes();
    const res2 = mockRes();
    const ids: string[] = [];

    await Promise.all([
      new Promise<void>((resolve) => {
        tracingMiddleware(req1 as never, res1 as never, () => {
          ids[0] = getTraceId();
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        tracingMiddleware(req2 as never, res2 as never, () => {
          ids[1] = getTraceId();
          resolve();
        });
      }),
    ]);

    expect(ids[0]).toMatch(UUID_PATTERN);
    expect(ids[1]).toMatch(UUID_PATTERN);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('should generate a fresh trace ID when an empty x-trace-id header is provided', () => {
    const req = mockReq({ headers: { 'x-trace-id': '' } });
    const res = mockRes();
    let capturedTraceId: string | undefined;

    tracingMiddleware(req as never, res as never, () => {
      capturedTraceId = getTraceId();
    });

    // Empty string should be treated as absent — a new UUID must be generated
    expect(capturedTraceId).toMatch(UUID_PATTERN);
  });

  it('should reject an oversized x-trace-id header and generate a fresh UUID', () => {
    const oversizedId = 'a'.repeat(201);
    const req = mockReq({ headers: { 'x-trace-id': oversizedId } });
    const res = mockRes();
    let capturedTraceId: string | undefined;

    tracingMiddleware(req as never, res as never, () => {
      capturedTraceId = getTraceId();
    });

    // Oversized header must not be echoed back
    expect(capturedTraceId).not.toBe(oversizedId);
    expect(capturedTraceId).toMatch(UUID_PATTERN);
  });

  it('should reject a trace ID containing control characters and generate a fresh UUID', () => {
    const maliciousId = 'trace\r\nX-Injected: header';
    const req = mockReq({ headers: { 'x-trace-id': maliciousId } });
    const res = mockRes();
    let capturedTraceId: string | undefined;

    tracingMiddleware(req as never, res as never, () => {
      capturedTraceId = getTraceId();
    });

    expect(capturedTraceId).not.toBe(maliciousId);
    expect(capturedTraceId).toMatch(UUID_PATTERN);
  });
});
