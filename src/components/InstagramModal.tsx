'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import NextImage from 'next/image';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';

interface InstagramModalProps {
  isOpen: boolean;
  photos: Array<{
    id: string;
    src: string;
    title?: string;
    model_name?: string;
    category?: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  userId: string | null;
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

  const safePhotos = useMemo(() => photos.filter(p => p.src && p.src.trim()), [photos]);
  
  const clampedIndex = Math.min(Math.max(currentIndex, 0), safePhotos.length - 1);
  const currentPhoto = safePhotos.length > 0 ? safePhotos[clampedIndex] : null;

  // Call hooks unconditionally - they will be used for empty state too
  const likes = useLikes(currentPhoto?.id || '', userId);
  const comments = useComments(currentPhoto?.id || '');

  const { count: likeCount, isLiked, toggleLike } = likes;
  const { comments: commentList, count: commentCount, addComment } = comments;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row"
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

          {/* Image Section - Center */}
          <div className="flex-1 flex flex-col items-center justify-center relative pt-16 md:pt-0 overflow-hidden">
            <motion.div
              key={clampedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center px-2 md:px-4"
            >
              <NextImage
                src={currentPhoto!.src}
                alt={currentPhoto!.title || 'Photo'}
                fill
                priority
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            {/* Navigation Arrows - Mobile */}
            <div className="md:hidden absolute inset-x-0 flex justify-between items-center px-4 pointer-events-none">
              {clampedIndex > 0 && (
                <motion.button
                  onClick={handlePreviousPhoto}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="pointer-events-auto text-white/70 hover:text-white transition"
                >
                  <ChevronUp size={32} />
                </motion.button>
              )}
            </div>

            {clampedIndex < safePhotos.length - 1 && (
              <motion.button
                onClick={handleNextPhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-24 md:bottom-4 text-white/70 hover:text-white transition pointer-events-auto"
              >
                <ChevronDown size={32} />
              </motion.button>
            )}

            {/* Photo Counter */}
            <div className="absolute top-4 right-4 md:static md:mt-4 text-white/70 text-sm">
              {clampedIndex + 1} / {safePhotos.length}
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden md:flex md:w-96 flex-col border-l border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
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
                >
                  <Heart
                    size={24}
                    className={isLiked ? 'fill-red-500 text-red-500' : ''}
                  />
                </motion.button>

                <motion.button
                  onClick={() => setShowComments(!showComments)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 hover:text-white transition relative"
                >
                  <MessageCircle size={24} />
                  {commentCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  <Share2 size={24} />
                </motion.button>

                <div className="ml-auto text-red-500 font-semibold">{likeCount}</div>
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
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40"
                  />
                  <motion.button
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                  >
                    {submittingComment ? '...' : 'Envoyer'}
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
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition"
                  >
                    Partager
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Bar */}
          <div className="md:hidden fixed bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 space-y-3">
            {/* Photo Info */}
            {currentPhoto?.title && (
              <div className="space-y-1">
                <p className="text-white font-medium text-sm">{currentPhoto.title}</p>
                {currentPhoto.model_name && (
                  <p className="text-gray-400 text-xs">{currentPhoto.model_name}</p>
                )}
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-white/70 hover:text-white transition"
              >
                <Heart
                  size={24}
                  className={isLiked ? 'fill-red-500 text-red-500' : ''}
                />
                <span className="text-sm">{likeCount}</span>
              </motion.button>

              <motion.button
                onClick={() => setShowComments(!showComments)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-white/70 hover:text-white transition"
              >
                <MessageCircle size={24} />
                <span className="text-sm">{commentCount}</span>
              </motion.button>

              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/70 hover:text-white transition"
              >
                <Share2 size={24} />
              </motion.button>
            </div>

            {/* Comment Input - Mobile */}
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 pt-2 border-t border-white/10"
              >
                <div className="max-h-32 overflow-y-auto space-y-2 mb-2">
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
                    className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40"
                  />
                  <motion.button
                    onClick={handleCommentSubmit}
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-medium px-3 py-1 rounded transition text-xs"
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
