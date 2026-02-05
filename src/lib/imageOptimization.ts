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
  // Detect slow connections - with fallback for iPhone Safari
  isSlowConnection: () => {
    if (typeof window === 'undefined') return false;
    try {
      // iPhone Safari may not have navigator.connection
      if ('connection' in navigator) {
        const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
        if (conn) {
          const effectiveType = conn.effectiveType ?? '4g';
          const saveData = conn.saveData ?? false;
          return saveData || effectiveType === '3g' || effectiveType === '4g';
        }
      }
      // Fallback: assume 4g on iPhone/Safari
      return false;
    } catch (err) {
      console.warn('Error detecting connection:', err);
      return false; // Safe fallback
    }
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

// Preload image with timeout - NEVER USE IN LOOPS!
// Use: preload max 1-2 images (current + next only)
export async function preloadImageWithTimeout(
  src: string,
  timeout: number = 3000
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
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
    } catch (err) {
      console.warn(`Preload error for ${src}:`, err);
      resolve(false);
    }
  });
}

// SAFE preload for carousel: max 2 images only (current + next)
export function safePreloadAdjacentImages(currentSrc: string, nextSrc?: string): void {
  if (!currentSrc) return;
  
  // Current image
  try {
    const img1 = new window.Image();
    img1.decoding = 'async';
    img1.src = currentSrc;
  } catch (err) {
    console.warn(`Could not preload current image:`, err);
  }
  
  // Only preload NEXT if provided
  if (nextSrc) {
    try {
      const img2 = new window.Image();
      img2.decoding = 'async';
      img2.src = nextSrc;
    } catch (err) {
      console.warn(`Could not preload next image:`, err);
    }
  }
}
