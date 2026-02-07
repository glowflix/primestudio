'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface InstagramModalProps {
  isOpen: boolean;
  photos: Array<{
    id: string;
    src: string;
    title?: string;
    model_name?: string;
    category?: string;
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
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  const safePhotos = useMemo(() => photos.filter(p => p.src && p.src.trim()), [photos]);
  const clampedIndex = Math.min(Math.max(currentIndex, 0), safePhotos.length - 1);
  const currentPhoto = safePhotos[clampedIndex];

  // Call hooks unconditionally
  const { count: likeCount, isLiked, toggleLike } = useLikes(currentPhoto?.id || '', userId);
  const { comments: commentList, count: commentCount, addComment } = useComments(currentPhoto?.id || '');

  // Load creator profile from Supabase
  useEffect(() => {
    if (!currentPhoto?.userId) {
      setCreatorProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        // Try to get from profiles table if it exists
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, avatar_url, display_name')
          .eq('id', currentPhoto.userId)
          .single();

        if (profileData) {
          setCreatorProfile({
            id: profileData.id,
            email: profileData.email,
            avatar_url: profileData.avatar_url,
            display_name: profileData.display_name,
          });
        } else {
          // Fallback: just use email from photos table (if available)
          // You can extend this to query auth.users if needed
          setCreatorProfile(null);
        }
      } catch (err) {
        console.error('Failed to load creator profile:', err);
      }
    };

    loadProfile();
  }, [currentPhoto?.userId]);

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
    if (!userId) return;
    toggleLike();
  };

  const handleCommentSubmit = async () => {
    if (!userId || !newComment.trim()) return;
    
    setSubmittingComment(true);
    const success = await addComment(userId, newComment);
    if (success) {
      setNewComment('');
    }
    setSubmittingComment(false);
  };

  const handleShare = () => {
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') handlePreviousPhoto();
      if (e.key === 'ArrowDown') handleNextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 text-white hover:text-gray-300 z-10 md:hidden"
          >
            <X size={28} />
          </motion.button>

          {/* Counter (top right) */}
          <div className="absolute top-4 right-4 text-white/70 text-xs z-10">
            {clampedIndex + 1} / {safePhotos.length}
          </div>

          {/* Image Section - Center */}
          <div className="flex-1 flex flex-col items-center justify-center relative pt-16 md:pt-0 overflow-hidden cursor-grab active:cursor-grabbing">
            <motion.div
              key={clampedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center px-2 md:px-4"
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

            {/* Navigation Arrows - Mobile */}
            {clampedIndex > 0 && (
              <motion.button
                onClick={handlePreviousPhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden absolute top-1/2 left-2 text-white/70 hover:text-white transition"
              >
                <ChevronUp size={32} />
              </motion.button>
            )}

            {clampedIndex < safePhotos.length - 1 && (
              <motion.button
                onClick={handleNextPhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-32 md:bottom-4 text-white/70 hover:text-white transition"
              >
                <ChevronDown size={32} />
              </motion.button>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden md:flex md:w-96 flex-col border-l border-white/10 bg-black">
            {/* Header with creator */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  {currentPhoto?.title && (
                    <p className="text-white font-semibold text-sm">{currentPhoto.title}</p>
                  )}
                  {currentPhoto?.model_name && (
                    <p className="text-gray-400 text-xs mt-1">{currentPhoto.model_name}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Creator Profile */}
              {creatorProfile && (
                <Link href={`/profile/${creatorProfile.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer">
                    {creatorProfile.avatar_url && (
                      <NextImage
                        src={creatorProfile.avatar_url}
                        alt={creatorProfile.display_name || creatorProfile.email}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {creatorProfile.display_name || creatorProfile.email.split('@')[0]}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{creatorProfile.email}</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div className="border-t border-white/10 p-4 space-y-3">
              {/* Like & Comment Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition"
                  title={userId ? '' : 'Connectez-vous pour liker'}
                >
                  <Heart
                    size={20}
                    className={isLiked ? 'fill-red-500 text-red-500' : ''}
                  />
                </motion.button>

                <motion.button
                  onClick={() => setShowComments(!showComments)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition relative"
                >
                  <MessageCircle size={20} />
                  {commentCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {commentCount}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setShowShare(!showShare)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition"
                >
                  <Share2 size={20} />
                </motion.button>

                <div className="ml-auto text-red-500 font-semibold text-sm">{likeCount}</div>
              </div>

              {/* Comment Input */}
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2"
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

          {/* Mobile Bottom Bar */}
          <div className="md:hidden fixed bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 space-y-3">
            {/* Creator Profile */}
            {creatorProfile && (
              <Link href={`/profile/${creatorProfile.id}`}>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer">
                  {creatorProfile.avatar_url && (
                    <NextImage
                      src={creatorProfile.avatar_url}
                      alt={creatorProfile.display_name || creatorProfile.email}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {creatorProfile.display_name || creatorProfile.email.split('@')[0]}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Photo Info */}
            {currentPhoto?.title && (
              <div className="space-y-1">
                <p className="text-white font-medium text-xs">{currentPhoto.title}</p>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-white/70 hover:text-white transition"
                title={userId ? '' : 'Connectez-vous pour liker'}
              >
                <Heart
                  size={18}
                  className={isLiked ? 'fill-red-500 text-red-500' : ''}
                />
                <span className="text-xs">{likeCount}</span>
              </motion.button>

              <motion.button
                onClick={() => setShowComments(!showComments)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-white/70 hover:text-white transition"
              >
                <MessageCircle size={18} />
                <span className="text-xs">{commentCount}</span>
              </motion.button>

              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/70 hover:text-white transition"
              >
                <Share2 size={18} />
              </motion.button>
            </div>

            {/* Comment Input - Mobile */}
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 pt-2 border-t border-white/10"
              >
                <div className="max-h-24 overflow-y-auto space-y-2 mb-2">
                  {commentList.map((comment) => (
                    <div key={comment.id} className="text-xs">
                      <p className="text-gray-400 font-medium">
                        {comment.user?.email || 'Anonyme'}
                      </p>
                      <p className="text-white/90">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    placeholder="Ajouter un commentaire..."
                    disabled={!userId}
                    className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 disabled:opacity-50"
                  />
                  <motion.button
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim() || !userId}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium px-2 py-1 rounded transition text-xs"
                  >
                    {submittingComment ? '...' : 'OK'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
