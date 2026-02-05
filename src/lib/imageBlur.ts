/**
 * Generate blur data URLs for progressive image loading
 * Instagram-style: blur-up effect with fast placeholder
 */

export const BLUR_DATA_URLS: Record<string, string> = {
  // Minimal blur placeholders for key images
  '/images/267A1009.webp':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXJzPjxmaWx0ZXIgaWQ9ImEiPjxmZVRvcm5hZG8gYmFzZUZyZXF1ZW5jeT0iLjAyIiBudW1PY3RhdmVzPSI0IiBzZWVkPSIxIi8+PGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImEiIHNjYWxlPSI2MCIgeHhSZXN1bHQ9Im91dCIvPjwvZmlsdGVyPjwvZmlsdGVycz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIiBmaWx0ZXI9InVybCgjYSkiIHZ5PjwvcmVjdD48L3N2Zz4=',
  '/images/267A1002.webp':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXJzPjxmaWx0ZXIgaWQ9ImEiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIuMDIiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjEiLz48ZmVEaXNwbGFjZW1lbnRNYXAgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iYSIgc2NhbGU9IjYwIiB4eGJlc3VsdD0ib3V0Ii8+PC9maWx0ZXI+PC9maWx0ZXJzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMzMzMiIGZpbHRlcj0idXJsKCNhKSIgeHk+PC9yZWN0Pjwvc3ZnPg==',
};

/**
 * Get blur data URL for an image
 * Falls back to solid color if not available
 */
export function getBlurDataURL(src: string): string {
  return BLUR_DATA_URLS[src] || createSolidPlaceholder();
}

/**
 * Create a minimal solid color placeholder
 * Very fast to render, perfect for initial load
 */
export function createSolidPlaceholder(color: string = '#1a1a1a'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='${encodeURIComponent(color)}' width='400' height='300'/%3E%3C/svg%3E`;
}

/**
 * Create animated gradient placeholder
 * More engaging than solid color
 */
export function createGradientPlaceholder(): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231a1a1a'/%3E%3Cstop offset='100%25' style='stop-color:%232a2a2a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='300'/%3E%3C/svg%3E`;
}

/**
 * For carousel: batch preload blur URLs to memory
 */
export function preloadBlurURLs(imageArray: string[]): void {
  if (typeof window === 'undefined') return;

  imageArray.forEach((src) => {
    const blurURL = getBlurDataURL(src);
    const img = new window.Image();
    img.src = blurURL;
  });
}

export default {
  getBlurDataURL,
  createSolidPlaceholder,
  createGradientPlaceholder,
  preloadBlurURLs,
} as const;
