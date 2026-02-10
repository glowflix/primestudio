'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Bookmark, UserPlus, UserCheck, Send } from 'lucide-react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useSaved } from '@/hooks/useSaved';
import ModelProfileModal from '@/components/ModelProfileModal';

interface InstagramModalProps {
  isOpen: boolean;
  photos: Array<{
    id: string;
    src: string;
    title?: string;
    model_name?: string;
    category?: string;
    description?: string;
    userId?: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  userId: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
}

export default function InstagramModal({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onIndexChange,
  userId,
}: InstagramModalProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
  const [likeBurst, setLikeBurst] = useState(0);
  const [sharePulse, setSharePulse] = useState(0);
  const [swipeOffsetY, setSwipeOffsetY] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [commentFocused, setCommentFocused] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('up');
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState<string>('');

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const lastTapTime = useRef(0);
  const bigHeartTimeout = useRef<NodeJS.Timeout | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const safePhotos = useMemo(() => photos.filter(p => p.src && p.src.trim()), [photos]);
  const clampedIndex = Math.min(Math.max(currentIndex, 0), safePhotos.length - 1);
  const currentPhoto = safePhotos[clampedIndex];

  // Static photo = local gallery (non-UUID id)
  const isStaticPhoto = currentPhoto ? !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentPhoto.id) : false;
  const modelName = currentPhoto?.model_name?.trim();
  const modelLabel = modelName ? `Modèle: ${modelName}` : null;
  const showDescription = Boolean(currentPhoto?.description && (!modelLabel || currentPhoto.description !== modelLabel));
  const modelLink = modelName ? `/store?model=${encodeURIComponent(modelName)}` : null;
  const modelAvatar = useMemo(() => {
    if (!modelName) return undefined;
    return safePhotos.find((photo) => photo.model_name?.trim() === modelName)?.src || currentPhoto?.src;
  }, [safePhotos, modelName, currentPhoto?.src]);
  const displayName = isStaticPhoto ? 'Prime Studio' : (modelName || creatorProfile?.display_name || creatorProfile?.email?.split('@')[0] || 'Utilisateur');
  const displaySub = creatorProfile?.email || null;
  const profileLink = modelLink || (creatorProfile ? `/profile/${creatorProfile.id}` : null);
  const showModelLabel = Boolean(modelName && displayName !== modelName);
  const avatarUrl = isStaticPhoto ? '/images/photosprofile.png' : (creatorProfile?.avatar_url || modelAvatar);

  // Hooks
  const { count: likeCount, isLiked, toggleLike } = useLikes(currentPhoto?.id || '', userId);
  const { comments: commentList, count: commentCount, loading: commentsLoading, addComment } = useComments(currentPhoto?.id || '');
  const { isSaved, toggleSave } = useSaved(currentPhoto?.id || '', userId);

  useEffect(() => {
    setCreatorProfile(null);
  }, [currentPhoto?.userId]);

  // Reset states on photo change
  useEffect(() => {
    setShowComments(false);
    setShowShare(false);
    setCommentFocused(false);
  }, [clampedIndex]);

  const goToAuth = useCallback(() => {
    const nextUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/auth?next=${nextUrl}`);
  }, [router]);

  const handlePreviousPhoto = useCallback(() => {
    if (clampedIndex > 0) {
      setSlideDirection('down');
      onIndexChange(clampedIndex - 1);
    }
  }, [clampedIndex, onIndexChange]);

  const handleNextPhoto = useCallback(() => {
    if (clampedIndex < safePhotos.length - 1) {
      setSlideDirection('up');
      onIndexChange(clampedIndex + 1);
    }
  }, [clampedIndex, safePhotos.length, onIndexChange]);

  // Double-tap to like with big heart overlay
  const handleDoubleTap = useCallback(() => {
    if (!userId) return goToAuth();
    if (!isLiked) {
      toggleLike();
    }
    setLikeBurst((v) => v + 1);
    setShowBigHeart(true);
    if (bigHeartTimeout.current) clearTimeout(bigHeartTimeout.current);
    bigHeartTimeout.current = setTimeout(() => setShowBigHeart(false), 900);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, [userId, isLiked, toggleLike, goToAuth]);

  const handleLike = () => {
    if (!userId) return goToAuth();
    toggleLike();
    setLikeBurst((v) => v + 1);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const handleCommentSubmit = async () => {
    if (!userId) return goToAuth();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const success = await addComment(userId, newComment);
    if (success) setNewComment('');
    setSubmittingComment(false);
  };

  const handleShare = () => {
    setSharePulse((v) => v + 1);
    const shareText = `Découvrez cette photo de Prime Studio 📸\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Prime Studio', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
    setShowShare(false);
  };

  const handleSave = async () => {
    if (!userId) return goToAuth();
    const result = await toggleSave();
    if (result.saved) router.push('/profile?tab=saved');
  };

  const handleFollow = () => {
    if (!userId) return goToAuth();
    setIsFollowing((v) => !v);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  // ── VERTICAL Touch Swipe (Instagram-style up/down) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    setSwipeOffsetY(0);

    // Double-tap detection
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      handleDoubleTap();
    }
    lastTapTime.current = now;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't swipe if comment input is focused
    if (commentFocused) return;

    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only swipe vertically if movement is mostly vertical
    if (deltaX < 50 && Math.abs(deltaY) > 15) {
      isSwiping.current = true;
      setSwipeOffsetY(deltaY * 0.35);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      setSwipeOffsetY(0);
      return;
    }

    const threshold = 70;
    // Swipe UP → next photo
    if (swipeOffsetY < -threshold && clampedIndex < safePhotos.length - 1) {
      handleNextPhoto();
    }
    // Swipe DOWN → previous photo
    else if (swipeOffsetY > threshold && clampedIndex > 0) {
      handlePreviousPhoto();
    }
    setSwipeOffsetY(0);
    isSwiping.current = false;
  };

  // Mouse drag (desktop) — both vertical and horizontal
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseDown = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    mouseDown.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDown.current) return;
    mouseDown.current = false;
    const dX = e.clientX - dragStart.current.x;
    const dY = e.clientY - dragStart.current.y;

    // Prefer the dominant axis
    if (Math.abs(dY) > Math.abs(dX) && Math.abs(dY) > 60) {
      if (dY < 0) handleNextPhoto();
      else handlePreviousPhoto();
    } else if (Math.abs(dX) > 60) {
      if (dX > 0) handlePreviousPhoto();
      else handleNextPhoto();
    }
  };

  // Wheel scroll
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      const modal = document.querySelector('[data-modal="instagram"]');
      if (!modal || !modal.contains(e.target)) return;
      e.preventDefault();
      if (e.deltaY > 0 && clampedIndex < safePhotos.length - 1) handleNextPhoto();
      else if (e.deltaY < 0 && clampedIndex > 0) handlePreviousPhoto();
    },
    [clampedIndex, safePhotos.length, handleNextPhoto, handlePreviousPhoto]
  );

  useEffect(() => {
    if (!isOpen) return;
    const modal = document.querySelector('[data-modal="instagram"]') as HTMLElement;
    if (!modal) return;
    modal.addEventListener('wheel', handleWheel as EventListener, { passive: false });
    return () => modal.removeEventListener('wheel', handleWheel as EventListener);
  }, [isOpen, handleWheel]);

  // Keyboard navigation & prevent body scroll
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') handlePreviousPhoto();
      if (e.key === 'ArrowDown') handleNextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handlePreviousPhoto, handleNextPhoto]);

  // Slide animation variants (vertical)
  const slideVariants = {
    enter: (dir: 'up' | 'down') => ({
      opacity: 0,
      y: dir === 'up' ? 120 : -120,
      scale: 0.95,
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (dir: 'up' | 'down') => ({
      opacity: 0,
      y: dir === 'up' ? -120 : 120,
      scale: 0.95,
    }),
  };

  // Like burst particles (8 particles for richer effect)
  const LikeBurstParticles = ({ burst }: { burst: number }) => (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={`burst-${burst}-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 3,
            background: i % 3 === 0 ? '#f43f5e' : i % 3 === 1 ? '#ec4899' : '#fb7185',
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, Math.cos((Math.PI * 2 * i) / 8) * 18],
            y: [0, Math.sin((Math.PI * 2 * i) / 8) * 18],
            scale: [0, 1.2, 0],
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      ))}
    </>
  );

  // Facebook-style verified badge
  const VerifiedBadge = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M12 0L14.59 3.07L18.36 1.91L18.98 5.82L22.92 6.02L22.09 9.84L25.44 11.54L23.36 14.82L25.72 17.68L22.64 19.68L23.56 23.52L19.72 23.7L18.08 27.16L14.52 25.74L12 28.44L9.48 25.74L5.92 27.16L4.28 23.7L0.44 23.52L1.36 19.68L-1.72 17.68L0.64 14.82L-1.44 11.54L1.91 9.84L1.08 6.02L5.02 5.82L5.64 1.91L9.41 3.07L12 0Z" transform="scale(0.85) translate(1, 1)" fill="#1DA1F2" />
      <path d="M9.5 12.5L11 14.5L15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Follow button component
  const FollowButton = ({ compact = false }: { compact?: boolean }) => {
    if (isStaticPhoto) {
      return (
        <span className={`flex items-center gap-1 rounded-full font-semibold bg-white/10 text-white/50 border border-white/10 ${compact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs'}`}>
          Masqué
        </span>
      );
    }
    return (
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleFollow();
        }}
        whileTap={{ scale: 0.9 }}
        className={`flex items-center gap-1 rounded-full font-semibold transition-all duration-200 ${
          isFollowing
            ? 'bg-white/10 text-white border border-white/20'
            : 'bg-pink-500 text-white'
        } ${compact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs'}`}
      >
        {isFollowing ? (
          <>
            <UserCheck size={compact ? 12 : 14} />
            <span>Suivi</span>
          </>
        ) : (
          <>
            <UserPlus size={compact ? 12 : 14} />
            <span>Suivre</span>
          </>
        )}
      </motion.button>
    );
  };

  // Big Heart overlay (double-tap)
  const BigHeartOverlay = () => (
    <AnimatePresence>
      {showBigHeart && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: [0, 1.3, 1], rotate: [-15, 5, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Heart
              size={90}
              className="fill-white text-white drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(244,63,94,0.6))' }}
            />
          </motion.div>
          {/* Expanding ring */}
          <motion.div
            className="absolute w-32 h-32 border-2 border-white/30 rounded-full"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Expandable comment input
  const CommentInput = () => (
    <motion.div className="flex flex-col gap-0">
      {/* Gradient separator line */}
      <div className="relative h-[1px] w-full mb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent"
          animate={{ opacity: commentFocused ? [0.4, 1, 0.4] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div className="relative">
        {/* Glow effect behind textarea when focused */}
        <AnimatePresence>
          {commentFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-pink-500/20 via-red-500/15 to-pink-500/20 blur-sm pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-end gap-2">
          {/* Avatar indicator */}
          <motion.div
            animate={{ scale: commentFocused ? 1 : 0.9, opacity: commentFocused ? 1 : 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex-shrink-0 mb-1.5"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30 border border-white/10 flex items-center justify-center">
              <MessageCircle size={13} className="text-pink-400/70" />
            </div>
          </motion.div>

          <div className="flex-1 relative">
            <motion.textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
              onFocus={() => setCommentFocused(true)}
              onBlur={() => {
                if (!newComment.trim()) setCommentFocused(false);
              }}
              placeholder="Ajouter un commentaire..."
              disabled={!userId}
              animate={{
                height: commentFocused ? 80 : 38,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-2xl px-4 py-2.5 text-[16px] text-white placeholder:text-gray-500/80 focus:outline-none focus:border-pink-500/40 focus:bg-white/[0.08] disabled:opacity-40 resize-none transition-all duration-300"
              style={{ scrollbarWidth: 'none' }}
            />

            {/* Send button inline (visible when has text) */}
            <AnimatePresence>
              {!commentFocused && newComment.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={handleCommentSubmit}
                  disabled={submittingComment || !userId}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/20"
                >
                  <Send size={13} className="text-white ml-0.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expanded footer bar */}
        <AnimatePresence>
          {commentFocused && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex justify-between items-center mt-2 pl-9 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                  {newComment.length > 0 ? (
                    <span className="text-pink-400/60">{newComment.length}</span>
                  ) : (
                    '⏎ Entrée'
                  )}
                </span>
                {newComment.length > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: Math.min(newComment.length * 0.8, 40) }}
                    className="h-[2px] rounded-full bg-gradient-to-r from-pink-500/50 to-transparent"
                  />
                )}
              </div>
              <motion.button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !newComment.trim() || !userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-30 disabled:hover:from-pink-500 disabled:hover:to-red-500 text-white font-semibold px-5 py-1.5 rounded-full transition-all text-xs shadow-lg shadow-pink-500/20 flex items-center gap-1.5"
              >
                {submittingComment ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Send size={11} />
                    Publier
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  // Progress indicator (vertical dots on the side)
  const ProgressIndicator = () => {
    if (safePhotos.length <= 1) return null;
    const maxDots = 7;
    const start = Math.max(0, clampedIndex - Math.floor(maxDots / 2));
    const end = Math.min(safePhotos.length, start + maxDots);
    const dots = Array.from({ length: end - start }, (_, i) => start + i);

    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {dots.map((idx) => (
          <motion.div
            key={idx}
            animate={{
              scale: idx === clampedIndex ? 1.4 : 1,
              opacity: idx === clampedIndex ? 1 : 0.35,
            }}
            className={`w-1.5 h-1.5 rounded-full ${
              idx === clampedIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    );
  };

  // Empty state
  if (safePhotos.length === 0 || !isOpen) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          >
            <X size={32} className="text-white absolute top-4 right-4 cursor-pointer hover:text-gray-300" onClick={onClose} />
            <p className="text-gray-400">Aucune image</p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && currentPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[70] flex flex-col md:flex-row"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-modal="instagram"
        >
          {/* ═══════════ MOBILE LAYOUT ═══════════ */}
          <div className="md:hidden flex flex-col h-full w-full select-none">
            {/* Top Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-black flex-shrink-0 z-10">
              {/* Creator Profile */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {profileLink ? (
                  <button onClick={(e) => { e.stopPropagation(); if (modelName) { setSelectedModelName(modelName); setShowModelModal(true); } else if (creatorProfile) { router.push(`/profile/${creatorProfile.id}`); } }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                    {avatarUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-500/40">
                        <NextImage src={avatarUrl} alt={displayName} width={32} height={32} className="w-8 h-8 object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold truncate flex items-center gap-1">
                        {displayName}
                        {isStaticPhoto && <VerifiedBadge size={13} />}
                      </p>
                      {showModelLabel && (
                        <p className="text-pink-300/80 text-[10px] font-medium truncate">{modelLabel}</p>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {avatarUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-500/40">
                        <NextImage src={avatarUrl} alt={displayName} width={32} height={32} className="w-8 h-8 object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold truncate flex items-center gap-1">
                        {displayName}
                        {isStaticPhoto && <VerifiedBadge size={13} />}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow Button */}
              <FollowButton compact />

              {/* Close */}
              <button onClick={onClose} className="text-white/70 active:text-white ml-1 flex-shrink-0">
                <X size={24} />
              </button>
            </div>

            {/* Image Section — Full swipe area */}
            <div className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing touch-none">
              {/* Progress dots (right side) */}
              <ProgressIndicator />

              {/* Counter */}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/80 text-[11px] z-10 font-medium">
                {clampedIndex + 1}/{safePhotos.length}
              </div>

              <AnimatePresence mode="popLayout" custom={slideDirection}>
                <motion.div
                  key={clampedIndex}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ y: isSwiping.current ? swipeOffsetY : 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <NextImage
                    src={currentPhoto.src}
                    alt={currentPhoto.title || 'Photo'}
                    fill
                    priority
                    className="object-contain"
                    sizes="100vw"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Big Heart overlay on double-tap */}
              <BigHeartOverlay />

              {/* Swipe hint (only on first photo) */}
              {clampedIndex === 0 && safePhotos.length > 1 && (
                <motion.div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.7, 0] }}
                  transition={{ duration: 2.5, repeat: 2, delay: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center pt-1"
                  >
                    <div className="w-1 h-2 bg-white/60 rounded-full" />
                  </motion.div>
                  <span className="text-white/40 text-[10px]">Glissez</span>
                </motion.div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="bg-black border-t border-white/10 flex-shrink-0">
              {/* Photo Info */}
              {currentPhoto?.title && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white font-bold text-sm">{currentPhoto.title}</p>
                  {showDescription && (
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{currentPhoto.description}</p>
                  )}
                </div>
              )}

              {/* Actions Row */}
              <div className="flex items-center gap-1 px-3 py-2">
                {/* Like */}
                {isStaticPhoto ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg">
                    <Heart size={24} className="text-red-500/60" />
                    <span className="text-sm font-semibold text-red-400/70">Masqué</span>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleLike}
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg active:bg-white/5 transition"
                  >
                    <motion.span
                      key={`like-m-${likeBurst}`}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.35, 1], rotate: [0, -12, 0] }}
                      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      className="inline-flex relative"
                    >
                      <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white/80'} />
                      <LikeBurstParticles burst={likeBurst} />
                    </motion.span>
                    <span className={`text-sm font-semibold ${isLiked ? 'text-red-400' : 'text-white/70'}`}>
                      {likeCount}
                    </span>
                  </motion.button>
                )}

                {/* Comment */}
                {isStaticPhoto ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg">
                    <MessageCircle size={24} className="text-white/40" />
                    <span className="text-sm font-medium text-white/40">Désactivé</span>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => {
                      if (!userId) return goToAuth();
                      setShowComments(!showComments);
                      if (!showComments) setTimeout(() => commentInputRef.current?.focus(), 200);
                    }}
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg active:bg-white/5 transition"
                  >
                    <MessageCircle size={24} className="text-white/80" />
                    <span className="text-sm font-medium text-white/70">{commentCount}</span>
                  </motion.button>
                )}

                {/* Share */}
                <motion.button
                  onClick={handleShare}
                  whileTap={{ scale: 0.85 }}
                  className="px-2 py-1.5 rounded-lg active:bg-white/5 transition"
                >
                  <motion.span
                    key={`share-m-${sharePulse}`}
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex"
                  >
                    <Share2 size={24} className="text-white/80" />
                  </motion.span>
                </motion.button>

                {/* Save - pushed to right */}
                <motion.button
                  onClick={handleSave}
                  whileTap={{ scale: 0.85 }}
                  className="ml-auto px-2 py-1.5 rounded-lg active:bg-white/5 transition"
                >
                  <Bookmark size={24} className={isSaved ? 'fill-pink-500 text-pink-500' : 'text-white/80'} />
                </motion.button>
              </div>

              {/* Comments Section (expandable) */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="px-4 py-3 space-y-3 max-h-48 overflow-y-auto">
                      {/* Existing comments */}
                      {commentList.length > 0 ? (
                        <div className="space-y-2.5">
                          {commentList.map((comment) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex gap-2"
                            >
                              {comment.user_avatar ? (
                                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                                  <NextImage src={comment.user_avatar} alt="" width={24} height={24} className="w-6 h-6 object-cover" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-white/70">
                                    {(comment.user_display || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-pink-400 text-xs font-semibold">
                                  {comment.user_display || 'Utilisateur'}
                                </p>
                                <p className="text-white/90 text-[13px] leading-relaxed">{comment.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : commentsLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="flex gap-2 animate-pulse">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                              <div className="space-y-1 flex-1">
                                <div className="h-2.5 w-16 bg-white/10 rounded" />
                                <div className="h-2.5 w-32 bg-white/5 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs text-center py-2">Aucun commentaire</p>
                      )}

                      {/* Comment Input */}
                      <div className="pt-1">
                        <CommentInput />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ═══════════ DESKTOP LAYOUT ═══════════ */}
          {/* Desktop Sidebar (Right) */}
          <div className="hidden md:flex md:w-[400px] flex-col border-l border-white/10 bg-neutral-950">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} className="text-white/70 hover:text-white">
                <X size={28} />
              </motion.button>
            </div>

            {/* Counter */}
            <div className="absolute top-5 left-5 text-white/60 text-xs z-10 font-medium">
              {clampedIndex + 1} / {safePhotos.length}
            </div>

            {/* Header */}
            <div className="p-5 border-b border-white/10 space-y-4 bg-gradient-to-b from-black to-neutral-950/80">
              {currentPhoto?.title && (
                <div>
                  <p className="text-white font-bold text-lg">{currentPhoto.title}</p>
                  {showDescription && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{currentPhoto.description}</p>
                  )}
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Creator + Follow */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                {profileLink ? (
                  <button onClick={(e) => { e.stopPropagation(); if (modelName) { setSelectedModelName(modelName); setShowModelModal(true); } else if (creatorProfile) { router.push(`/profile/${creatorProfile.id}`); } }} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-500/30">
                        <NextImage src={avatarUrl} alt={displayName} width={40} height={40} className="w-10 h-10 object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate flex items-center gap-1.5">
                        {displayName}
                        {isStaticPhoto && <VerifiedBadge size={15} />}
                      </p>
                      {displaySub && <p className="text-gray-500 text-xs truncate">{displaySub}</p>}
                      {showModelLabel && <p className="text-pink-300/80 text-xs font-medium truncate">{modelLabel}</p>}
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-500/30">
                        <NextImage src={avatarUrl} alt={displayName} width={40} height={40} className="w-10 h-10 object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate flex items-center gap-1.5">
                        {displayName}
                        {isStaticPhoto && <VerifiedBadge size={15} />}
                      </p>
                      {showModelLabel && <p className="text-pink-300/80 text-xs font-medium truncate">{modelLabel}</p>}
                    </div>
                  </div>
                )}
                <FollowButton />
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {commentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-20 bg-white/10 rounded" />
                        <div className="h-3 w-40 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : commentList.length > 0 ? (
                commentList.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    {comment.user_avatar ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <NextImage src={comment.user_avatar} alt="" width={28} height={28} className="w-7 h-7 object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white/70">
                          {(comment.user_display || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-pink-400 text-xs font-semibold">
                        {comment.user_display || 'Utilisateur'}
                      </p>
                      <p className="text-white/90 text-sm mt-0.5 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageCircle size={32} className="text-white/10 mb-2" />
                  <p className="text-gray-500 text-sm">Aucun commentaire</p>
                  <p className="text-gray-600 text-xs mt-1">Soyez le premier à commenter</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-white/10 p-5 space-y-4 bg-gradient-to-b from-neutral-950/80 to-black">
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isStaticPhoto ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg">
                    <Heart size={24} className="text-red-500/60" />
                    <span className="text-sm font-bold text-red-400/70">Masqué</span>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleLike}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                  >
                    <motion.span
                      key={`like-d-${likeBurst}`}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.35, 1], rotate: [0, -12, 0] }}
                      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      className="inline-flex relative"
                    >
                      <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white/70'} />
                      <LikeBurstParticles burst={likeBurst} />
                    </motion.span>
                    <span className={`text-sm font-bold ${isLiked ? 'text-red-400' : 'text-white/60'}`}>{likeCount}</span>
                  </motion.button>
                )}

                {isStaticPhoto ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg">
                    <MessageCircle size={24} className="text-white/40" />
                    <span className="text-xs font-medium text-white/40">Désactivé</span>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => {
                      if (!userId) return goToAuth();
                      setShowComments(!showComments);
                      setTimeout(() => commentInputRef.current?.focus(), 200);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                  >
                    <MessageCircle size={24} className="text-white/70" />
                    {commentCount > 0 && (
                      <span className="text-xs font-medium text-white/50">{commentCount}</span>
                    )}
                  </motion.button>
                )}

                <motion.button
                  onClick={() => {
                    setSharePulse((v) => v + 1);
                    setShowShare(!showShare);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  className="px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  <motion.span
                    key={`share-d-${sharePulse}`}
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex"
                  >
                    <Share2 size={24} className="text-white/70" />
                  </motion.span>
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  className="ml-auto px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  <Bookmark size={24} className={isSaved ? 'fill-pink-500 text-pink-500' : 'text-white/70'} />
                </motion.button>
              </div>

              {/* Comment Input (always visible on desktop, hidden for static) */}
              {!isStaticPhoto && <CommentInput />}

              {/* Share Menu */}
              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <button
                      onClick={handleShare}
                      className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-xs transition border border-white/10"
                    >
                      Copier le lien
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Image — LEFT SIDE (swipe with mouse drag + wheel, no arrows) */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing select-none">
            {/* Progress dots for desktop */}
            <ProgressIndicator />

            <AnimatePresence mode="popLayout" custom={slideDirection}>
              <motion.div
                key={clampedIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-full h-full flex items-center justify-center px-4"
              >
                <NextImage
                  src={currentPhoto.src}
                  alt={currentPhoto.title || 'Photo'}
                  fill
                  priority
                  className="object-contain"
                  sizes="70vw"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Big Heart overlay for desktop */}
            <BigHeartOverlay />
          </div>

          {/* Model Profile Modal */}
          <ModelProfileModal
            isOpen={showModelModal}
            modelName={selectedModelName}
            onClose={() => setShowModelModal(false)}
            allPhotos={safePhotos}
            userId={userId}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}