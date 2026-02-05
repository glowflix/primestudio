/**
 * Safe Image Loader Hook
 * Prevents iPhone crashes by limiting concurrent image loads
 */

import { useEffect, useState } from 'react';
import { IMAGE_CONFIG, isIOSDevice } from '@/lib/imageConfig';

interface SafeImageLoaderOptions {
  maxConcurrent?: number;
  onProgress?: (loaded: number, total: number) => void;
}

export function useSafeImageLoader(imageUrls: string[], options: SafeImageLoaderOptions = {}) {
  const maxConcurrent = options.maxConcurrent || IMAGE_CONFIG.GALLERY.MAX_CONCURRENT_LOADS;
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    let activeLoads = 0;
    let currentIndex = 0;
    const loaded = new Set<string>();
    const failed = new Set<string>();

    const loadNext = () => {
      if (currentIndex >= imageUrls.length) {
        if (activeLoads === 0) {
          setIsLoading(false);
          setLoadedImages(loaded);
          setFailedImages(failed);
        }
        return;
      }

      if (activeLoads >= maxConcurrent) return;

      const url = imageUrls[currentIndex];
      currentIndex++;
      activeLoads++;

      const img = new Image();
      img.src = url;

      img.onload = () => {
        loaded.add(url);
        activeLoads--;
        options.onProgress?.(loaded.size, imageUrls.length);
        setLoadedImages(new Set(loaded));
        if (isIOSDevice()) {
          console.debug(`[SAFE_LOADER] Loaded: ${url} (${loaded.size}/${imageUrls.length})`);
        }
        loadNext();
      };

      img.onerror = () => {
        failed.add(url);
        activeLoads--;
        console.warn(`[SAFE_LOADER] Failed: ${url}`);
        loadNext();
      };

      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!loaded.has(url) && !failed.has(url)) {
          failed.add(url);
          activeLoads--;
          loadNext();
        }
      }, 10000); // 10 second timeout
    };

    // Start loading up to maxConcurrent images
    for (let i = 0; i < maxConcurrent && i < imageUrls.length; i++) {
      loadNext();
    }
  }, [imageUrls, maxConcurrent, options]);

  return {
    loadedImages,
    failedImages,
    isLoading,
    loadedCount: loadedImages.size,
    totalCount: imageUrls.length,
    progressPercent: imageUrls.length > 0 ? Math.round((loadedImages.size / imageUrls.length) * 100) : 0,
  };
}

export default useSafeImageLoader;
