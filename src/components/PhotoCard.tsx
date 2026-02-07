'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';

type PhotoCardProps = {
  id: string;
  image_url: string;
  title?: string;
  model_name?: string;
  category?: string;
  userId: string | null;
};

export default function PhotoCard({
  id,
  image_url,
  title,
  model_name,
  category,
  userId,
}: PhotoCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { count: likeCount, isLiked, toggleLike } = useLikes(id, userId);
  const { comments, count: commentCount, addComment } = useComments(id);

  const handleLike = () => {
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }
    toggleLike();
  };

  const handleCommentSubmit = async () => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl overflow-hidden bg-black/50 border border-white/10 hover:border-pink-500/50 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-black">
        <OptimizedImage
          src={image_url}
          alt={title || 'Photo'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Category */}
        <div className="space-y-1">
          {title && <p className="text-white font-medium text-sm">{title}</p>}
          {model_name && <p className="text-gray-400 text-xs">{model_name}</p>}
          {category && (
            <span className="inline-block px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">
              {category}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm transition"
          >
            <Heart
              size={18}
              className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
            <span className="text-gray-400">{likeCount}</span>
          </motion.button>

          <motion.button
            onClick={() => setShowComments(!showComments)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm text-gray-400 transition"
          >
            <MessageCircle size={18} />
            <span>{commentCount}</span>
          </motion.button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 space-y-3 border-t border-white/10 max-h-64 overflow-y-auto"
          >
            {/* Comments List */}
            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 rounded p-2 text-xs text-gray-300"
                >
                  <p className="font-medium text-gray-400">
                    {comment.user?.email || 'Anonyme'}
                  </p>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Commentaire..."
                className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500"
              />
              <motion.button
                onClick={handleCommentSubmit}
                disabled={submittingComment}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-xs rounded transition"
              >
                {submittingComment ? '...' : 'OK'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center rounded-xl z-50"
        >
          <div className="bg-black/90 border border-pink-500/50 rounded-lg p-4 text-center space-y-3">
            <p className="text-white font-medium">Connectez-vous pour interagir</p>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded transition"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
