'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useSaved } from '@/hooks/useSaved';

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
  const [isDragging, setIsDragging] = useState(false);
  const [likeBurst, setLikeBurst] = useState(0);
  const [sharePulse, setSharePulse] = useState(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  const safePhotos = useMemo(() => photos.filter(p => p.src && p.src.trim()), [photos]);
  const clampedIndex = Math.min(Math.max(currentIndex, 0), safePhotos.length - 1);
  const currentPhoto = safePhotos[clampedIndex];
  const modelName = currentPhoto?.model_name?.trim();
  const modelLabel = modelName ? `ModÃ¨le: ${modelName}` : null;
  const showDescription = Boolean(currentPhoto?.description && (!modelLabel || currentPhoto.description !== modelLabel));
  const modelLink = modelName ? `/store?model=${encodeURIComponent(modelName)}` : null;
  const modelAvatar = useMemo(() => {
    if (!modelName) return undefined;
    return safePhotos.find((photo) => photo.model_name?.trim() === modelName)?.src || currentPhoto?.src;
  }, [safePhotos, modelName, currentPhoto?.src]);
  const displayName = modelName || creatorProfile?.display_name || creatorProfile?.email?.split('@')[0] || 'Utilisateur';
  const displaySub = creatorProfile?.email || null;
  const profileLink = modelLink || (creatorProfile ? `/profile/${creatorProfile.id}` : null);
  const showModelLabel = Boolean(modelName && displayName !== modelName);
  const avatarUrl = creatorProfile?.avatar_url || modelAvatar;

  // Call hooks unconditionally
  const { count: likeCount, isLiked, toggleLike } = useLikes(currentPhoto?.id || '', userId);
  const { comments: commentList, count: commentCount, addComment } = useComments(currentPhoto?.id || '');
  const { isSaved, toggleSave } = useSaved(currentPhoto?.id || '', userId);

  useEffect(() => {
    setCreatorProfile(null);
  }, [currentPhoto?.userId]);

  const goToAuth = useCallback(() => {
    const nextUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/auth?next=${nextUrl}`);
  }, [router]);

  const handlePreviousPhoto = useCallback(() => {
    if (clampedIndex > 0) {
      onIndexChange(clampedIndex - 1);
      setShowComments(false);
    }
  }, [clampedIndex, onIndexChange]);

  const handleNextPhoto = useCallback(() => {
    if (clampedIndex < safePhotos.length - 1) {
      onIndexChange(clampedIndex + 1);
      setShowComments(false);
    }
  }, [clampedIndex, safePhotos.length, onIndexChange]);

  const handleLike = () => {
    if (!userId) return goToAuth();
    toggleLike();
    setLikeBurst((value) => value + 1);
  };

  const handleCommentSubmit = async () => {
    if (!userId) return goToAuth();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const success = await addComment(userId, newComment);
    if (success) {
      setNewComment('');
    }
    setSubmittingComment(false);
  };

  const handleShare = () => {
    setSharePulse((value) => value + 1);
    const shareText = `Découvrez cette photo de Prime Studio 📸\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: 'Prime Studio',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
    setShowShare(false);
  };

  const handleSave = async () => {
    if (!userId) return goToAuth();
    const result = await toggleSave();
    if (result.saved) {
      router.push('/profile?tab=saved');
    }
  };

  // Drag/Swipe handling
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const delta = e.clientX - dragStartX.current;
    const deltaY = Math.abs(e.clientY - dragStartY.current);

    // Only swipe if vertical movement is small (not scrolling)
    if (deltaY > 50) return;

    // Swipe right = previous photo
    if (delta > 50 && clampedIndex > 0) {
      handlePreviousPhoto();
    }
    // Swipe left = next photo
    else if (delta < -50 && clampedIndex < safePhotos.length - 1) {
      handleNextPhoto();
    }
  };

  // Wheel scroll handling for navigation
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Check if the target is inside the modal
      if (!(e.target instanceof HTMLElement) || !e.currentTarget) return;
      const modal = document.querySelector('[data-modal="instagram"]');
      if (!modal || !modal.contains(e.target as HTMLElement)) return;

      // Prevent default scroll behavior
      e.preventDefault();

      // Scroll down or wheel down = next photo
      if (e.deltaY > 0 && clampedIndex < safePhotos.length - 1) {
        handleNextPhoto();
      }
      // Scroll up or wheel up = previous photo
      else if (e.deltaY < 0 && clampedIndex > 0) {
        handlePreviousPhoto();
      }
    },
    [clampedIndex, safePhotos.length, handleNextPhoto, handlePreviousPhoto]
  );

  useEffect(() => {
    if (!isOpen) return;
    const modal = document.querySelector('[data-modal="instagram"]') as HTMLElement;
    if (!modal) return;

    modal.addEventListener('wheel', handleWheel as EventListener, { passive: false });
    return () => {
      modal.removeEventListener('wheel', handleWheel as EventListener);
    };
  }, [isOpen, handleWheel]);

  // Keyboard navigation & prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    // Prevent scrolling when modal is open
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

  // Early return if no photos
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
            <X 
              size={32} 
              className="text-white absolute top-4 right-4 cursor-pointer hover:text-gray-300"
              onClick={onClose}
            />
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
          className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          data-modal="instagram"
        >
          {/* MOBILE LAYOUT */}
          <div className="md:hidden flex flex-col h-full w-full">
            {/* Top Header with Creator Profile */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/15 bg-gradient-to-b from-black/95 to-black/80 flex-shrink-0">
              {/* Creator Profile - LEFT */}
              {profileLink ? (
                <Link href={profileLink}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {avatarUrl ? (
                      <NextImage
                        src={avatarUrl}
                        alt={displayName}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                      {displaySub && (
                        <p className="text-gray-400 text-[11px] truncate">{displaySub}</p>
                      )}
                      {showModelLabel && (
                        <p className="text-pink-300/90 text-[11px] font-medium truncate">{modelLabel}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                    {showModelLabel && (
                      <p className="text-pink-300/90 text-[11px] font-medium truncate">{modelLabel}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Close Button - RIGHT */}
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white hover:text-gray-300 flex-shrink-0 ml-auto"
              >
                <X size={28} />
              </motion.button>
            </div>

            {/* Image Section - CENTER (FLEX GROW) */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing w-full">
              {/* Counter (top right) */}
              <div className="absolute top-4 right-4 text-white/70 text-xs z-10">
                {clampedIndex + 1} / {safePhotos.length}
              </div>

              <motion.div
                key={clampedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center px-2"
              >
                {currentPhoto && (
                  <NextImage
                    src={currentPhoto.src}
                    alt={currentPhoto.title || 'Photo'}
                    fill
                    priority
                    className="object-contain"
                    sizes="100vw"
                    draggable={false}
                  />
                )}
              </motion.div>

              {/* Navigation Arrows */}
              {clampedIndex > 0 && (
                <motion.button
                  onClick={handlePreviousPhoto}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-1/4 left-2 text-white/70 hover:text-white transition z-40"
                >
                  <ChevronUp size={32} />
                </motion.button>
              )}

              {clampedIndex < safePhotos.length - 1 && (
                <motion.button
                  onClick={handleNextPhoto}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition z-40"
                >
                  <ChevronDown size={32} />
                </motion.button>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-gradient-to-t from-black/96 via-black/85 to-black/70 px-4 py-5 space-y-4 flex-shrink-0 border-t border-white/15 max-h-64 overflow-y-auto">
              {/* Photo Info */}
              {currentPhoto?.title && (
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">{currentPhoto.title}</p>
                  {showDescription && (
                    <p className="text-gray-300 text-xs leading-relaxed">{currentPhoto.description}</p>
                  )}
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Actions Row */}
              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                  title={userId ? '' : 'Connectez-vous pour liker'}
                >
                  <motion.span
                    key={`like-${likeBurst}`}
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.35, 1], rotate: [0, -8, 0] }}
                    transition={{ duration: 0.35 }}
                    className="inline-flex"
                  >
                    <Heart
                      size={22}
                      className={isLiked ? 'fill-red-500 text-red-500' : ''}
                    />
                  </motion.span>
                  <motion.span
                    key={`like-count-${likeBurst}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-medium"
                  >
                    {likeCount}
                  </motion.span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    if (!userId) return goToAuth();
                    setShowComments(!showComments);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <MessageCircle size={22} />
                  <span className="text-xs font-medium">{commentCount}</span>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition"
                >
                  <motion.span
                    key={`share-${sharePulse}`}
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 12, 0] }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex"
                  >
                    <Share2 size={22} />
                  </motion.span>
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto text-white/70 hover:text-white transition"
                >
                  <Bookmark
                    size={22}
                    className={isSaved ? 'fill-pink-500 text-pink-500' : ''}
                  />
                </motion.button>
              </div>

              {/* Comments Section */}
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-3 pt-3 border-t border-white/20"
                >
                  {commentList.length > 0 ? (
                    <div className="max-h-20 overflow-y-auto space-y-2">
                      {commentList.map((comment) => (
                        <div key={comment.id} className="text-xs">
                          <p className="text-gray-400 font-medium">
                            {comment.user?.email || 'Anonyme'}
                          </p>
                          <p className="text-white/90 text-xs">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Aucun commentaire encore</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                      placeholder="Ajouter un commentaire..."
                      disabled={!userId}
                      className="flex-1 bg-white/10 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 disabled:opacity-50"
                    />
                    <motion.button
                      onClick={handleCommentSubmit}
                      disabled={submittingComment || !newComment.trim() || !userId}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium px-2.5 py-1.5 rounded transition text-xs"
                    >
                      {submittingComment ? '...' : 'OK'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden md:flex md:w-96 flex-col border-l border-white/15 bg-neutral-950">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white hover:text-gray-300"
              >
                <X size={28} />
              </motion.button>
            </div>

            {/* Counter (top desktop) */}
            <div className="absolute top-4 left-4 text-white/70 text-xs z-10">
              {clampedIndex + 1} / {safePhotos.length}
            </div>

            {/* Header with creator */}
            <div className="p-4 border-b border-white/15 space-y-3 bg-gradient-to-b from-black to-neutral-950/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  {currentPhoto?.title && (
                    <p className="text-white font-bold text-base">{currentPhoto.title}</p>
                  )}
                  {showDescription && (
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{currentPhoto.description}</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Creator Profile */}
              {profileLink ? (
                <Link href={profileLink}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition cursor-pointer border border-white/10">
                    {avatarUrl ? (
                      <NextImage
                        src={avatarUrl}
                        alt={displayName}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                      {displaySub && (
                        <p className="text-gray-400 text-xs truncate">{displaySub}</p>
                      )}
                      {showModelLabel && (
                        <p className="text-pink-300/90 text-xs font-medium truncate">{modelLabel}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-white/10">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                    {showModelLabel && (
                      <p className="text-pink-300/90 text-xs font-medium truncate">{modelLabel}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/70">
              {commentList.length > 0 ? (
                commentList.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <p className="text-gray-400 text-xs font-medium">
                      {comment.user?.email || 'Anonyme'}
                    </p>
                    <p className="text-white/90 text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucun commentaire encore</p>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-white/15 p-5 space-y-4 bg-gradient-to-b from-neutral-950/60 to-black">
              {/* Like & Comment Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition"
                  title={userId ? '' : 'Connectez-vous pour liker'}
                >
                  <motion.span
                    key={`like-desktop-${likeBurst}`}
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.35, 1], rotate: [0, -8, 0] }}
                    transition={{ duration: 0.35 }}
                    className="inline-flex"
                  >
                    <Heart
                      size={22}
                      className={isLiked ? 'fill-red-500 text-red-500' : ''}
                    />
                  </motion.span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    if (!userId) return goToAuth();
                    setShowComments(!showComments);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition relative"
                >
                  <MessageCircle size={22} />
                  {commentCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {commentCount}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setSharePulse((value) => value + 1);
                    setShowShare(!showShare);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition"
                >
                  <motion.span
                    key={`share-desktop-${sharePulse}`}
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 12, 0] }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex"
                  >
                    <Share2 size={22} />
                  </motion.span>
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto text-white/70 hover:text-white transition"
                >
                  <Bookmark
                    size={22}
                    className={isSaved ? 'fill-pink-500 text-pink-500' : ''}
                  />
                </motion.button>

                <div className="text-red-500 font-semibold text-sm">{likeCount}</div>
              </div>

              {/* Comment Input */}
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-2"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    placeholder="Ajouter un commentaire..."
                    disabled={!userId}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 disabled:opacity-50"
                  />
                  <motion.button
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim() || !userId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium px-3 py-2 rounded-lg transition text-xs"
                  >
                    {submittingComment ? '...' : 'OK'}
                  </motion.button>
                </motion.div>
              )}

              {/* Share Menu */}
              {showShare && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2"
                >
                  <button
                    onClick={handleShare}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs transition"
                  >
                    Partager
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Desktop Image Section - LEFT SIDE */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing">
            <motion.div
              key={clampedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center px-4"
            >
              {currentPhoto && (
                <NextImage
                  src={currentPhoto.src}
                  alt={currentPhoto.title || 'Photo'}
                  fill
                  priority
                  className="object-contain"
                  sizes="100vw"
                  draggable={false}
                />
              )}
            </motion.div>

            {/* Navigation Arrows - Desktop */}
            {clampedIndex > 0 && (
              <motion.button
                onClick={handlePreviousPhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-1/2 left-4 text-white/70 hover:text-white transition"
              >
                <ChevronUp size={32} />
              </motion.button>
            )}

            {clampedIndex < safePhotos.length - 1 && (
              <motion.button
                onClick={handleNextPhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition"
              >
                <ChevronDown size={32} />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
