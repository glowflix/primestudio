'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Share2, MoreHorizontal, CheckCircle } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';

type PhotoViewerProps = {
  photoId: string;
  imageUrl: string;
  title?: string;
  modelName?: string;
  category?: string;
  userId: string | null;
  onClose: () => void;
};

export default function PhotoViewer({
  photoId,
  imageUrl,
  title,
  modelName,
  category,
  userId,
  onClose,
}: PhotoViewerProps) {
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { count: likeCount, isLiked, toggleLike } = useLikes(photoId, userId);
  const { comments, addComment, deleteComment } = useComments(photoId);

  const handleLike = () => {
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }
    toggleLike();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const success = await addComment(userId, newComment);

    if (success) {
      setNewComment('');
    }

    setSubmittingComment(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 hover:bg-white/10 rounded-full transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={28} className="text-white" />
        </motion.button>

        {/* Main Container */}
        <motion.div
          className="w-full h-full md:h-auto md:max-w-5xl md:rounded-2xl md:border md:border-white/10 bg-black overflow-hidden grid grid-cols-1 md:grid-cols-2"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Image */}
          <motion.div className="relative aspect-square md:aspect-auto bg-black flex items-center justify-center overflow-hidden">
            <OptimizedImage
              src={imageUrl}
              alt={title || 'Photo'}
              fill
              className="object-contain"
            />
          </motion.div>

          {/* Right: Info & Comments */}
          <div className="flex flex-col bg-black md:border-l md:border-white/10">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{title || 'Prime Studio'}</h2>
                  <CheckCircle size={20} className="text-blue-400" />
                </div>
                {modelName && <p className="text-sm text-gray-400">{modelName}</p>}
                {category && (
                  <span className="inline-block mt-1 px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">
                    {category}
                  </span>
                )}
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition">
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-96">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Aucun commentaire pour le moment</p>
                  <p className="text-xs mt-2">
                    {userId ? 'Soyez le premier à commenter!' : 'Connectez-vous pour commenter'}
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">
                          {comment.user?.email?.split('@')[0] || 'Anonyme'}
                        </p>
                        <p className="text-gray-300 text-sm break-words">{comment.content}</p>
                      </div>
                      {userId === comment.user_id && (
                        <button
                          onClick={() => deleteComment(comment.id, userId)}
                          className="text-red-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-4 md:p-6 border-t border-white/10 space-y-4">
              {/* Like & Comment Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleLike}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                  >
                    <Heart
                      size={24}
                      className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                  >
                    <MessageCircle size={24} className="text-gray-400" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                  >
                    <Share2 size={24} className="text-gray-400" />
                  </motion.button>
                </div>
              </div>

              {/* Like Count */}
              <div className="text-sm font-medium text-white">
                <span className="text-pink-500 font-bold">{likeCount}</span> j&apos;aime
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={userId ? 'Ajouter un commentaire...' : 'Connectez-vous pour commenter'}
                  disabled={!userId || submittingComment}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
                {newComment.trim() && (
                  <motion.button
                    type="submit"
                    disabled={submittingComment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
                  >
                    {submittingComment ? 'Envoi...' : 'Commenter'}
                  </motion.button>
                )}
              </form>
            </div>
          </div>
        </motion.div>

        {/* Login Prompt */}
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowLoginPrompt(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-black border border-pink-500/50 rounded-xl p-6 text-center space-y-4 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white">Connectez-vous</h3>
              <p className="text-gray-400">
                Vous devez être connecté pour aimer et commenter les photos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition"
                >
                  Fermer
                </button>
                <a
                  href="/auth"
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium transition block"
                >
                  Se connecter
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
