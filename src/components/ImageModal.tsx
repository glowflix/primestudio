'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2, MessageCircle } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastNavTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isTransitioning) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, isTransitioning, onClose]);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 400) return;
    lastNavTimeRef.current = now;
    
    setIsTransitioning(true);
    onIndexChange((currentIndex + 1) % images.length);
    setZoom(1);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [currentIndex, images.length, onIndexChange]);

  const handlePrevious = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 400) return;
    lastNavTimeRef.current = now;
    
    setIsTransitioning(true);
    onIndexChange((currentIndex - 1 + images.length) % images.length);
    setZoom(1);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [currentIndex, images.length, onIndexChange]);

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://primestudios.vercel.app';
    const imageUrl = `${url}${images[currentIndex]}`;
    
    if (platform === 'whatsapp') {
      const text = encodeURIComponent(shareMessage + `\n\n${url}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'facebook') {
      const text = encodeURIComponent(shareMessage);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    }
  };

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
                {currentIndex + 1} / {images.length}
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
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`Photo ${currentIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: zoom }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="max-w-full max-h-full object-contain"
                  style={{ transformOrigin: 'center center' }}
                />

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
                  onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
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

              {/* Share Buttons */}
              <div className="flex-1 flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShare(!showShare)}
                  disabled={isTransitioning}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 size={20} />
                  Partager
                </motion.button>
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

            {/* Share Menu */}
            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/20 rounded-lg p-3 flex gap-2 z-50"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      handleShare('whatsapp');
                      setShowShare(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.89-4.922 9.979 0 2.487.505 4.945 1.522 7.256l-1.628 5.686 5.858-1.588c2.391 1.243 5.024 1.9 7.661 1.9 9.444 0 17.134-7.529 17.134-16.986 0-4.549-1.747-8.75-4.923-11.92-3.176-3.171-7.432-4.926-11.667-4.926Z"/>
                    </svg>
                    WhatsApp
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      handleShare('facebook');
                      setShowShare(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
