'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NextImage from 'next/image';

interface CarouselProps {
  images: string[];
  autoplay?: boolean;
  interval?: number;
}

export default function Carousel({ images, autoplay = true, interval = 5000 }: CarouselProps) {
  const safeImages = useMemo(() => images.filter((src) => typeof src === 'string' && src.trim().length > 0), [images]);
  const shouldReduceMotion = useReducedMotion();

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);

  const autoplayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Keep index valid if images list changes.
    if (safeImages.length === 0) {
      setCurrent(0);
      setIsCurrentLoaded(false);
      return;
    }
    if (current >= safeImages.length) {
      setCurrent(0);
      setIsCurrentLoaded(false);
    }
  }, [safeImages.length, current]);

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

  useEffect(() => {
    // Preload current + adjacent images to reduce flicker/blank frames.
    if (safeImages.length === 0) return;

    const currentSrc = safeImages[current];
    const nextSrc = safeImages[(current + 1) % safeImages.length];
    const prevSrc = safeImages[(current - 1 + safeImages.length) % safeImages.length];

    [currentSrc, nextSrc, prevSrc]
      .filter(Boolean)
      .forEach((src) => {
        const img = new window.Image();
        img.decoding = 'async';
        img.src = src;
      });
  }, [current, safeImages]);

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
          key={safeImages[current] ?? current}
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

          <div className="relative w-full h-full">
            <NextImage
              src={safeImages[current]}
              alt={`Slide ${current + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={current === 0}
              className={`object-cover transition-opacity duration-300 ${isCurrentLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ willChange: 'opacity' }}
              onLoadingComplete={() => setIsCurrentLoaded(true)}
              onError={() => {
                // Prevent being stuck on a blank frame if an image fails to load.
                setIsCurrentLoaded(true);
                setIsAnimating(false);
              }}
            />
          </div>
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
