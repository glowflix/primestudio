'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NextImage from 'next/image';
import { getBlurDataURL } from '@/lib/imageBlur';
import { ImageDiagnosticsTracker } from '@/lib/imageDiagnostics';

interface CarouselProps {
  images: string[];
  autoplay?: boolean;
  interval?: number;
}

export default function Carousel({ images, autoplay = true, interval = 5000 }: CarouselProps) {
  // Strict validation of images array
  const safeImages = useMemo(() => {
    const validated = images.filter((src) => {
      const isValid = typeof src === 'string' && src.trim().length > 0;
      if (!isValid) {
        console.error('[CAROUSEL] Invalid image:', src);
      }
      return isValid;
    });

    // Log any missing images
    if (validated.length !== images.length) {
      console.warn('[CAROUSEL] Filtered out', images.length - validated.length, 'invalid images');
    }

    return validated;
  }, [images]);

  const shouldReduceMotion = useReducedMotion();

  // iPhone memory optimization: windowing (render only visible slides)
  const WINDOW_SIZE = 1; // Render current ± 1 slides only (3 max)

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const autoplayTimerRef = useRef<number | null>(null);
  const blurUrlsRef = useRef<Record<string, string>>({});

  // Validate index is within bounds
  const getValidIndex = useCallback(
    (idx: number) => {
      if (safeImages.length === 0) return 0;
      return Math.max(0, Math.min(idx, safeImages.length - 1));
    },
    [safeImages.length]
  );

  // Windowing: only render slides within view window (iPhone optimization)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const shouldRenderSlide = useCallback(
    (index: number): boolean => {
      if (safeImages.length === 0) return false;
      const distance = Math.abs(index - current);
      // Log windowing decisions for diagnostics
      if (distance > WINDOW_SIZE) {
        console.debug(`[CAROUSEL_WINDOW] Skipping render for index ${index} (distance: ${distance})`);
      }
      return distance <= WINDOW_SIZE;
    },
    [current, safeImages.length]
  );

  // Preload blur URLs on mount for smooth progressive loading
  // FIX: Blur seulement pour current + next (pas toutes les images!)
  const ensureBlur = useCallback(
    (src: string | null) => {
      if (!src) return;
      if (!blurUrlsRef.current[src]) {
        blurUrlsRef.current[src] = getBlurDataURL(src);
      }
    },
    []
  );

  useEffect(() => {
    // Keep index valid if images list changes
    if (safeImages.length === 0) {
      setCurrent(0);
      setIsCurrentLoaded(false);
      return;
    }

    // Clamp index to valid range
    const validIndex = getValidIndex(current);
    if (validIndex !== current) {
      console.warn('[CAROUSEL] Clamping index from', current, 'to', validIndex);
      setCurrent(validIndex);
      setIsCurrentLoaded(false);
    }
  }, [safeImages.length, current, getValidIndex]);

  useEffect(() => {
    if (!autoplay || safeImages.length <= 1 || isAnimating) return;

    if (autoplayTimerRef.current) {
      window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    autoplayTimerRef.current = window.setInterval(() => {
      setIsAnimating(true);
      setIsCurrentLoaded(false);
      setDirection(1);
      setCurrent((prev) => (prev + 1) % safeImages.length);
    }, interval);

    return () => {
      if (autoplayTimerRef.current) {
        window.clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [autoplay, interval, safeImages.length, isAnimating]);

  // Get currently displayed image safely
  const currentImageSrc = safeImages.length > 0 ? safeImages[getValidIndex(current)] : null;
  const nextImageSrc =
    safeImages.length > 0 ? safeImages[(getValidIndex(current) + 1) % safeImages.length] : null;

  // Generate blur only for current + next to avoid RAM explosion on iPhone
  useEffect(() => {
    ensureBlur(currentImageSrc);
    ensureBlur(nextImageSrc);
  }, [currentImageSrc, nextImageSrc, ensureBlur]);

  useEffect(() => {
    // REMOVED: Double preload with window.Image() causes iPhone crashes
    // Next/Image handles caching + lazy loading properly already
    // Removing manual preload saves: bandwidth, memory, decode operations
    if (!currentImageSrc) return;
    
    // Log for diagnostics only
    console.debug('[CAROUSEL] Displaying slide:', currentImageSrc);
  }, [currentImageSrc]);

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: shouldReduceMotion ? 0 : dir < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const paginate = useCallback((newDirection: number) => {
    if (safeImages.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setIsCurrentLoaded(false);
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + safeImages.length) % safeImages.length);
  }, [safeImages.length, isAnimating]);

  const handlePrevious = useCallback(() => paginate(-1), [paginate]);
  const handleNext = useCallback(() => paginate(1), [paginate]);

  if (safeImages.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] bg-gray-900 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">Aucune image disponible</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-2xl shadow-2xl bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentImageSrc ?? current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
            opacity: { duration: 0.3 },
          }}
          onAnimationComplete={() => setIsAnimating(false)}
          className="absolute inset-0 will-change-transform"
        >
          {!isCurrentLoaded && (
            <div className="absolute inset-0 bg-gray-900 animate-pulse" />
          )}

          {imageError && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
              <div className="text-center">
                <p className="text-red-400 text-sm mb-2">❌ Erreur de chargement</p>
                <p className="text-gray-400 text-xs break-all max-w-xs">{imageError}</p>
              </div>
            </div>
          )}

          {currentImageSrc && (
            <div className="relative w-full h-full">
              <NextImage
                src={currentImageSrc}
                alt={`Slide ${current + 1}`}
                fill
                sizes="(max-width: 768px) 90vw, 1200px"
                priority={current === 0}
                quality={current === 0 ? 85 : 75}
                placeholder={blurUrlsRef.current[currentImageSrc] ? 'blur' : 'empty'}
                blurDataURL={blurUrlsRef.current[currentImageSrc]}
                className={`object-cover transition-all duration-500 ease-out ${isCurrentLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
                style={{ willChange: 'opacity' }}
                loading={current === 0 ? 'eager' : 'lazy'}
                onLoad={() => {
                  setIsCurrentLoaded(true);
                  setImageError(null);
                  ImageDiagnosticsTracker.trackImageLoad(currentImageSrc, true);
                }}
                onError={(e) => {
                  const errorMsg = `Failed to load: ${currentImageSrc}`;
                  console.error('[CAROUSEL_IMAGE_ERROR]', errorMsg, e);
                  setImageError(errorMsg);
                  setIsCurrentLoaded(true);
                  setIsAnimating(false);
                  ImageDiagnosticsTracker.trackImageLoad(currentImageSrc, false, errorMsg);
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Navigation buttons */}
      <button
        onClick={handlePrevious}
        disabled={isAnimating}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        disabled={isAnimating}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur text-white p-2 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {safeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setDirection(index > current ? 1 : -1);
                setIsAnimating(true);
                setIsCurrentLoaded(false);
                setCurrent(index);
              }
            }}
            disabled={isAnimating}
            className={`h-2 rounded-full transition-all duration-300 disabled:opacity-50 ${
              index === current ? 'bg-white w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
