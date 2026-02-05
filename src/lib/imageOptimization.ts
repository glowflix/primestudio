// Image optimization utilities for mobile performance
// src/lib/imageOptimization.ts

export const IMAGE_QUALITY_SETTINGS = {
  carousel: {
    mobile: {
      sizes: '(max-width: 640px) 100vw',
      priority: true,
      quality: 75,
    },
    desktop: {
      sizes: '(max-width: 768px) 100vw, 1200px',
      priority: false,
      quality: 85,
    },
  },
  gallery: {
    mobile: {
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw',
      quality: 70,
    },
    desktop: {
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      quality: 80,
    },
  },
};

export const IMAGE_LOADING_STRATEGY = {
  // Detect slow connections
  isSlowConnection: () => {
    if (typeof window === 'undefined') return false;
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection?: { saveData: boolean; effectiveType: string } }).connection;
      return conn?.saveData || conn?.effectiveType === '3g' || conn?.effectiveType === '4g';
    }
    return false;
  },

  // Get appropriate image size for device
  getImageSizes: (isMobile: boolean) => {
    return isMobile ? IMAGE_QUALITY_SETTINGS.carousel.mobile : IMAGE_QUALITY_SETTINGS.carousel.desktop;
  },

  // Fallback for failed images
  handleImageError: (src: string) => {
    console.warn(`Image failed to load: ${src}`);
    // Return a data URL placeholder
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage not available%3C/text%3E%3C/svg%3E';
  },
};

// Preload image with timeout
export async function preloadImageWithTimeout(
  src: string,
  timeout: number = 3000
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = 'async';

    const timeoutId = setTimeout(() => {
      resolve(false);
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };

    img.src = src;
  });
}
