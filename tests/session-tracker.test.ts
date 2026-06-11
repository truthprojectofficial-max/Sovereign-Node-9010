import { describe, it, expect, beforeEach } from 'vitest';
import {
  sessionTracker,
  getSession,
  clearSessions,
  unlockSession,
} from '../src/middleware/session-tracker';

// Minimal mock Express objects
function mockReq(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    method: 'POST',
    path: '/api/analyze',
    headers: { 'x-session-id': 'test-user' },
    ip: '127.0.0.1',
    body: { text: 'hello' },
    ...overrides,
  };
}

function mockRes(): {
  statusCode: number;
  data: unknown;
  status: (code: number) => typeof res;
  json: (body: unknown) => void;
} & Record<string, unknown> {
  const res = {
    statusCode: 200,
    data: null as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.data = body;
    },
  };
  return res;
}

describe('Session Tracker Middleware', () => {
  beforeEach(() => {
    clearSessions();
  });

  it('should allow GET requests through without tracking', () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    let called = false;
    sessionTracker(req as never, res as never, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('should create a session on first POST', () => {
    const req = mockReq();
    const res = mockRes();
    let called = false;
    sessionTracker(req as never, res as never, () => {
      called = true;
    });
    expect(called).toBe(true);
    const session = getSession('test-user');
    expect(session).toBeDefined();
    expect(session!.attempts).toBe(1);
    expect(session!.locked).toBe(false);
  });

  it('should increment attempts on subsequent POSTs', () => {
    const req = mockReq();
    const res = mockRes();
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});
    const session = getSession('test-user');
    expect(session!.attempts).toBe(3);
  });

  it('should detect "no no no" repetition pattern', () => {
    const req = mockReq({ body: { text: 'no no no' } });
    const res = mockRes();
    sessionTracker(req as never, res as never, () => {});
    const session = getSession('test-user');
    expect(session!.repetitions).toBe(1);
  });

  it('should lock session after 3 repetition strikes', () => {
    const req = mockReq({ body: { text: 'no no no no' } });
    const res = mockRes();
    // Strike 1
    sessionTracker(req as never, res as never, () => {});
    // Strike 2
    sessionTracker(req as never, res as never, () => {});
    // Strike 3 — should lock
    sessionTracker(req as never, res as never, () => {});

    expect(res.statusCode).toBe(429);
    expect((res.data as Record<string, unknown>).error).toBe('SOVEREIGN_EXIT_REACHED');
    const session = getSession('test-user');
    expect(session!.locked).toBe(true);
  });

  it('should block all POST requests once locked', () => {
    const req = mockReq({ body: { text: 'no no no' } });
    const res = mockRes();
    // Lock the session
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});

    // Now send a normal request
    const normalReq = mockReq({ body: { text: 'clean request' } });
    const normalRes = mockRes();
    let nextCalled = false;
    sessionTracker(normalReq as never, normalRes as never, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(normalRes.statusCode).toBe(429);
  });

  it('should unlock a locked session', () => {
    const req = mockReq({ body: { text: 'no no no' } });
    const res = mockRes();
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});
    sessionTracker(req as never, res as never, () => {});

    expect(getSession('test-user')!.locked).toBe(true);

    const unlocked = unlockSession('test-user');
    expect(unlocked).toBe(true);
    expect(getSession('test-user')!.locked).toBe(false);
    expect(getSession('test-user')!.repetitions).toBe(0);
  });

  it('should return false when unlocking non-existent session', () => {
    const unlocked = unlockSession('non-existent');
    expect(unlocked).toBe(false);
  });

  it('should fall back to IP when no x-session-id header', () => {
    const req = mockReq({ headers: {}, ip: '10.0.0.1' });
    const res = mockRes();
    sessionTracker(req as never, res as never, () => {});
    const session = getSession('10.0.0.1');
    expect(session).toBeDefined();
  });
});
