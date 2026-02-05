/**
 * Image Loading Performance Configuration for Mobile
 * Prevents crashes on iPhone Safari with limited memory
 */

export const IMAGE_CONFIG = {
  // Gallery pagination
  GALLERY: {
    PAGE_SIZE: 12, // Max 12 images per page (avoid memory saturation)
    MAX_CONCURRENT_LOADS: 3, // Never load more than 3 simultaneously
    QUALITY_MOBILE: 70, // Reduced quality for mobile
    QUALITY_DESKTOP: 85,
  },

  // Carousel windowing
  CAROUSEL: {
    WINDOW_SIZE: 1, // Render current ± 1 slides (3 max visible)
    MAX_PRELOAD_IMAGES: 2, // Only current + next
    QUALITY_CURRENT: 85, // Full quality for active slide
    QUALITY_ADJACENT: 75, // Medium quality for next slides
    ANIMATION_DURATION: 400, // ms for slide transition
  },

  // Image constraints
  CONSTRAINTS: {
    MAX_IMAGE_WIDTH: 1600, // px - prevent oversized images
    MAX_IMAGE_SIZE_MOBILE: 400, // KB - uncompressed size limit
    MAX_IMAGE_SIZE_DESKTOP: 800, // KB
    WEBP_FORMAT: true, // Always use WebP
    LAZY_LOAD_THRESHOLD: 2, // Start loading 2 items before visible
  },

  // Memory safety
  MEMORY: {
    BYTES_PER_IMAGE_MB: 3, // Average: 2-4 MB per image in memory
    IPHONE_MEMORY_LIMIT_MB: 500, // Conservative limit for iPhone
    SAFE_CONCURRENT_IMAGES: 2, // Max images in RAM at once
  },

  // Diagnostics
  DIAGNOSTICS: {
    LOG_IMAGE_LOADS: true,
    LOG_MEMORY_USAGE: true,
    WARN_THRESHOLD_IMAGES: 4, // Warn if > 4 images loading
    ERROR_THRESHOLD_MEMORY: 0.8, // Warn if > 80% memory used
  },
};

/**
 * Detect if running on iPhone/iOS
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Get quality setting based on device and position
 */
export function getImageQuality(isActive: boolean): number {
  const isIOS = isIOSDevice();
  if (isIOS) {
    return isActive ? IMAGE_CONFIG.CAROUSEL.QUALITY_CURRENT : IMAGE_CONFIG.CAROUSEL.QUALITY_ADJACENT;
  }
  return IMAGE_CONFIG.CAROUSEL.QUALITY_CURRENT;
}

/**
 * Get page size based on device
 */
export function getGalleryPageSize(): number {
  const isIOS = isIOSDevice();
  // Reduce page size on mobile for safety
  return isIOS ? IMAGE_CONFIG.GALLERY.PAGE_SIZE : IMAGE_CONFIG.GALLERY.PAGE_SIZE;
}

/**
 * Warn if loading too many images simultaneously
 */
export function checkMemorySafety(imageCount: number): void {
  if (IMAGE_CONFIG.DIAGNOSTICS.LOG_MEMORY_USAGE) {
    if (imageCount > IMAGE_CONFIG.DIAGNOSTICS.WARN_THRESHOLD_IMAGES) {
      console.warn(
        `[MEMORY_WARNING] Loading ${imageCount} images simultaneously. Recommended max: ${IMAGE_CONFIG.MEMORY.SAFE_CONCURRENT_IMAGES}`
      );
    }
  }
}

export default IMAGE_CONFIG;
