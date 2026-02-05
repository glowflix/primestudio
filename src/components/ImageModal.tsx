'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageCircle } from 'lucide-react';
import NextImage from 'next/image';

// Professional SVG Share Icons - OFFICIAL LOGOS
const ShareIcons = {
  Share: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  WhatsApp: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      {/* Official WhatsApp logo - Green circle with white phone */}
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M17.6 9.5c-.3-1.5-1.4-2.8-2.9-3.3-.8-.2-1.7-.2-2.5 0-1.9.5-3.4 2-3.9 4-.2 1 0 2.1.5 3.1-.2 1.5-.8 2.9-1.6 4.1-.3.5-.1 1.2.4 1.4.5.2 1.1 0 1.3-.5.6-1 1.1-2.1 1.3-3.2.8.2 1.6.3 2.5.3 1.9 0 3.7-.7 5.1-2 1.4-1.3 2.3-3.1 2.5-5 .1-.6 0-1.3-.2-1.9z" fill="white" />
    </svg>
  ),
  Facebook: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      {/* Official Facebook logo */}
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="url(#instaGradient)">
      {/* Official Instagram logo with gradient */}
      <defs>
        <radialGradient id="instaGradient" cx="30%" cy="107%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#F77737" />
          <stop offset="60%" stopColor="#F74135" />
          <stop offset="90%" stopColor="#C320E5" />
        </radialGradient>
      </defs>
      {/* Rounded square background */}
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instaGradient)" />
      {/* Camera - outer circle */}
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="white" strokeWidth="1.2" />
      {/* Camera - inner circle/flash */}
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="white" strokeWidth="0.6" />
      {/* Flash circle top-left */}
      <circle cx="7.5" cy="6.5" r="0.7" fill="white" />
    </svg>
  ),
  Copy: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
};

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const shareMessage = "Découvrez les services professionnels de Prime Studio 📸\nSéances photos pour portraits, branding et contenu créatif!\n\n#PrimeStudio #Kinshasa #Photography";

export default function ImageModal({
  isOpen,
  images,
  currentIndex,
  onClose,
  onIndexChange,
}: ImageModalProps) {
  const safeImages = useMemo(
    () => images.filter((src) => typeof src === 'string' && src.trim().length > 0),
    [images]
  );

  // ✅ Detect mobile to prevent aggressive preload
  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  const clampedIndex = useMemo(() => {
    if (safeImages.length === 0) return 0;
    if (Number.isNaN(currentIndex)) return 0;
    return Math.min(Math.max(currentIndex, 0), safeImages.length - 1);
  }, [currentIndex, safeImages.length]);

  const [zoom, setZoom] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [firstPriority, setFirstPriority] = useState(false);
  const lastNavTimeRef = useRef(0);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowShare(false);
      setZoom(1);
      setIsTransitioning(false);
      setIsImageLoaded(false);
      setFirstPriority(false);
    } else {
      setFirstPriority(true);
      const t = window.setTimeout(() => setFirstPriority(false), 1200);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const MAX_ZOOM = isMobile ? 2 : 3;

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 400) return;
    lastNavTimeRef.current = now;

    if (safeImages.length === 0) return;
    if (safeImages.length === 1) return;
    
    setIsTransitioning(true);
    setIsImageLoaded(false);
    onIndexChange((clampedIndex + 1) % safeImages.length);
    setZoom(1);
    if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => setIsTransitioning(false), 400);
  }, [clampedIndex, safeImages.length, onIndexChange, isMobile]);

  const handlePrevious = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 400) return;
    lastNavTimeRef.current = now;

    if (safeImages.length === 0) return;
    if (safeImages.length === 1) return;
    
    setIsTransitioning(true);
    setIsImageLoaded(false);
    onIndexChange((clampedIndex - 1 + safeImages.length) % safeImages.length);
    setZoom(1);
    if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => setIsTransitioning(false), 400);
  }, [clampedIndex, safeImages.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    setIsImageLoaded(false);
  }, [isOpen, clampedIndex]);

  useEffect(() => {
    // ✅ iPhone: no preload adjacent (prevents memory saturation crash)
    if (!isOpen) return;
    if (safeImages.length === 0) return;
    if (isMobile) return; // Skip preload on iPhone/iPad

    // Desktop only: preload current + next (not prev)
    const currentSrc = safeImages[clampedIndex];
    const nextSrc = safeImages[(clampedIndex + 1) % safeImages.length];

    [currentSrc, nextSrc]
      .filter(Boolean)
      .forEach((src) => {
        const img = new window.Image();
        img.decoding = 'async';
        img.src = src;
      });
  }, [isOpen, clampedIndex, safeImages, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isTransitioning) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTransitioning, onClose, handlePrevious, handleNext]);

  if (safeImages.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center"
            >
              <div className="text-gray-300">Aucune image disponible</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-8 z-50 flex flex-col"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-between items-center mb-4 text-white"
            >
              <div className="text-sm font-medium">
                {clampedIndex + 1} / {safeImages.length}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </motion.button>
            </motion.div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-lg bg-black/50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-gray-900/60 animate-pulse" />
                )}

                <motion.div
                  key={clampedIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isImageLoaded ? 1 : 0, scale: zoom }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`relative w-full h-full transition-[filter] duration-300 ${isImageLoaded ? 'blur-0' : 'blur-sm'}`}
                  style={{ transformOrigin: 'center center' }}
                >
                  <NextImage
                    src={safeImages[clampedIndex]}
                    alt={`Photo ${clampedIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 1400px"
                    quality={isMobile ? 70 : 82}
                    priority={firstPriority && !isMobile}
                    loading={firstPriority ? 'eager' : 'lazy'}
                    placeholder="empty"
                    style={{ objectFit: 'contain' }}
                    draggable={false}
                    onLoadingComplete={() => setIsImageLoaded(true)}
                    onError={() => setIsImageLoaded(true)}
                  />
                </motion.div>

                {/* Message Overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur border border-white/20 rounded-lg p-4 text-white"
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle size={20} className="text-pink-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Prime Studio</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Explorez nos services professionnels de photographie. Qualité premium, créativité sans limite! 📸✨
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Zoom Controls */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/60 backdrop-blur p-2 rounded-lg"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setZoom(Math.min(zoom + 0.2, MAX_ZOOM))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <ZoomIn size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setZoom(Math.max(zoom - 0.2, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <ZoomOut size={20} />
                </motion.button>
              </motion.div>
            </div>

            {/* Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mt-4 gap-4"
            >
              {/* Navigation */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </motion.button>

              {/* Professional Share Button with Popup */}
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShare(!showShare)}
                    disabled={isTransitioning}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-5 h-5">{ShareIcons.Share}</div>
                    Partager
                  </motion.button>

                  {/* Share Popup with Animation */}
                  <AnimatePresence>
                    {showShare && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
                      >
                        <div className="bg-black/98 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-2xl min-w-80">
                          <div className="grid grid-cols-2 gap-6">
                            {/* WhatsApp */}
                            <motion.button
                              whileHover={{ scale: 1.1, y: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const url = typeof window !== 'undefined' ? window.location.href : '';
                                const text = encodeURIComponent(shareMessage + `\n\n${url}`);
                                window.open(`https://wa.me/?text=${text}`, '_blank');
                                setShowShare(false);
                              }}
                              className="flex flex-col items-center gap-4 px-8 py-6 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-2xl transition-all duration-300 border border-green-600/50 font-semibold"
                            >
                              <div className="w-14 h-14">{ShareIcons.WhatsApp}</div>
                              <span className="text-sm font-semibold leading-tight">WhatsApp</span>
                            </motion.button>

                            {/* Facebook */}
                            <motion.button
                              whileHover={{ scale: 1.1, y: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const url = typeof window !== 'undefined' ? window.location.href : '';
                                const text = encodeURIComponent(shareMessage);
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
                                setShowShare(false);
                              }}
                              className="flex flex-col items-center gap-4 px-8 py-6 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-2xl transition-all duration-300 border border-blue-600/50 font-semibold"
                            >
                              <div className="w-14 h-14">{ShareIcons.Facebook}</div>
                              <span className="text-sm font-semibold leading-tight">Facebook</span>
                            </motion.button>

                            {/* Instagram */}
                            <motion.button
                              whileHover={{ scale: 1.1, y: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                alert('Téléchargez l\'image et partagez-la sur Instagram Stories');
                                setShowShare(false);
                              }}
                              className="flex flex-col items-center gap-4 px-8 py-6 bg-gradient-to-br from-pink-600/20 to-purple-600/20 hover:from-pink-600/40 hover:to-purple-600/40 text-pink-300 rounded-2xl transition-all duration-300 border border-pink-600/50 font-semibold"
                            >
                              <div className="w-14 h-14">{ShareIcons.Instagram}</div>
                              <span className="text-sm font-semibold leading-tight">Instagram</span>
                            </motion.button>

                            {/* Copy Link */}
                            <motion.button
                              whileHover={{ scale: 1.1, y: -3 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const url = typeof window !== 'undefined' ? window.location.href : '';
                                navigator.clipboard.writeText(url);
                                setShowShare(false);
                              }}
                              className="flex flex-col items-center gap-4 px-8 py-6 bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 rounded-2xl transition-all duration-300 border border-gray-600/50 font-semibold"
                            >
                              <div className="w-14 h-14">{ShareIcons.Copy}</div>
                              <span className="text-sm font-semibold leading-tight">Copy Link</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={isTransitioning}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={24} />
              </motion.button>
            </motion.div>

            {/* Share Menu - Hidden (using popup instead) */}
            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="hidden"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
