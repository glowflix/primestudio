/**
 * Image Loading Diagnostics
 * Helps debug image loading issues on mobile vs desktop
 */

interface ImageDiagnostics {
  src: string;
  status: 'pending' | 'loading' | 'loaded' | 'failed';
  error?: string;
  loadTime?: number;
  timestamp: number;
  userAgent: string;
  isMobile: boolean;
}

export class ImageDiagnosticsTracker {
  private static diagnostics: ImageDiagnostics[] = [];
  private static maxLogs = 50;
  private static startTimes: Record<string, number> = {};

  static trackImageLoad(src: string, success: boolean, error?: string, loadTime?: number) {
    const isMobile = this.isMobileDevice();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

    const diagnostic: ImageDiagnostics = {
      src,
      status: success ? 'loaded' : 'failed',
      error,
      loadTime,
      timestamp: Date.now(),
      userAgent,
      isMobile,
    };

    this.diagnostics.push(diagnostic);
    if (this.diagnostics.length > this.maxLogs) {
      this.diagnostics.shift();
    }

    console.log(`[IMAGE_DIAGNOSTIC] ${src}:`, {
      status: success ? '✅ LOADED' : '❌ FAILED',
      time: loadTime ? `${loadTime}ms` : 'N/A',
      mobile: isMobile,
      error,
    });
  }

  // Start timing for an image load
  static start(src: string): void {
    this.startTimes[src] = performance.now();
  }

  // End timing and record diagnostic
  static end(src: string, success: boolean, error?: string): void {
    const start = this.startTimes[src];
    const loadTime = start ? Math.round(performance.now() - start) : undefined;
    delete this.startTimes[src];
    this.trackImageLoad(src, success, error, loadTime);
  }

  static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static getDiagnostics() {
    return this.diagnostics;
  }

  static getSummary() {
    const total = this.diagnostics.length;
    const loaded = this.diagnostics.filter((d) => d.status === 'loaded').length;
    const failed = this.diagnostics.filter((d) => d.status === 'failed').length;
    const mobile = this.diagnostics.filter((d) => d.isMobile).length;
    const desktop = total - mobile;

    const avgLoadTime =
      this.diagnostics.reduce((sum, d) => sum + (d.loadTime || 0), 0) / loaded || 0;

    console.log('[IMAGE_DIAGNOSTICS_SUMMARY]', {
      total,
      loaded,
      failed,
      failureRate: `${((failed / total) * 100).toFixed(1)}%`,
      mobile,
      desktop,
      avgLoadTimeMs: avgLoadTime.toFixed(0),
    });

    return {
      total,
      loaded,
      failed,
      failureRate: ((failed / total) * 100).toFixed(1),
      mobile,
      desktop,
      avgLoadTimeMs: avgLoadTime.toFixed(0),
    };
  }

  static logToConsole() {
    console.group('📊 IMAGE LOADING DIAGNOSTICS');
    console.table(this.diagnostics);
    console.log('Summary:', this.getSummary());
    console.groupEnd();
  }

  static exportAsJSON() {
    return JSON.stringify(
      {
        diagnostics: this.diagnostics,
        summary: this.getSummary(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

/**
 * Verify if image path is correct
 * Fallback to GET with Range header if HEAD fails (some servers don't allow HEAD)
 */
export async function verifyImagePath(src: string): Promise<boolean> {
  try {
    let response = await fetch(src, { method: 'HEAD' });
    
    // Fallback for servers that don't support HEAD (405) or opaque responses
    if (response.status === 405 || response.type === 'opaque') {
      response = await fetch(src, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      });
    }
    
    const exists = response.ok;
    console.log(`[IMAGE_VERIFY] ${src}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`, {
      status: response.status,
      statusText: response.statusText,
    });

    return exists;
  } catch (err) {
    console.error(`[IMAGE_VERIFY_ERROR] ${src}:`, err);
    return false;
  }
}

/**
 * Batch verify multiple images
 */
export async function verifyImagePaths(srcs: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  const checks = srcs.map(async (src) => {
    results[src] = await verifyImagePath(src);
  });

  await Promise.all(checks);
  return results;
}

const exported = {
  ImageDiagnosticsTracker,
  verifyImagePath,
  verifyImagePaths,
};
export default exported;
