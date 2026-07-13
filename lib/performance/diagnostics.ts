export function performanceDiagnosticsEnabled() {
  return process.env.NODE_ENV === "development" || process.env.PROJECT_GENESIS_PERF_LOGS === "true";
}

export async function measureAsync<T>(label: string, fn: () => Promise<T>, metadata: Record<string, unknown> = {}): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    if (performanceDiagnosticsEnabled()) {
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      console.info(`[Project Genesis perf] ${label}`, { durationMs, ...metadata });
    }
  }
}

export function measureSync<T>(label: string, fn: () => T, metadata: Record<string, unknown> = {}): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    if (performanceDiagnosticsEnabled()) {
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      console.info(`[Project Genesis perf] ${label}`, { durationMs, ...metadata });
    }
  }
}
