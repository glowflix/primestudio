'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Camera, Grid3X3, Film, MessageCircle } from 'lucide-react';
import NextImage from 'next/image';
import { createSupabaseClient } from '@/lib/supabase/client';
import InstagramModal from '@/components/InstagramModal';

interface ModelPhoto {
  id: string;
  src: string;
  title?: string;
  category?: string;
  description?: string;
  model_name?: string;
  userId?: string;
}

interface ModelProfileModalProps {
  isOpen: boolean;
  modelName: string;
  onClose: () => void;
  /** Optional: pass already-loaded photos to avoid refetch */
  allPhotos?: ModelPhoto[];
  userId?: string | null;
}

export default function ModelProfileModal({
  isOpen,
  modelName,
  onClose,
  allPhotos,
  userId,
}: ModelProfileModalProps) {
  const [modelPhotos, setModelPhotos] = useState<ModelPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState(0);
  const [likesLoading, setLikesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Filter photos for this model
  useEffect(() => {
    if (!isOpen || !modelName) return;
    setIsLoading(true);
    setLikesLoading(true);
    setSelectedPhotoIndex(null);

    const loadPhotos = async () => {
      let photos: ModelPhoto[] = [];

      // If allPhotos is supplied, filter from them
      if (allPhotos && allPhotos.length > 0) {
        photos = allPhotos.filter(
          (p) => p.model_name?.trim().toLowerCase() === modelName.trim().toLowerCase()
        );
      }

      // Also query Supabase for completeness
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('photos')
          .select('id, image_url, title, category, model_name, user_id')
          .ilike('model_name', modelName.trim())
          .eq('active', true);

        if (!error && data && data.length > 0) {
          const supaPhotos: ModelPhoto[] = data.map((p: { id: string; image_url: string; title: string | null; category: string | null; model_name: string | null; user_id?: string }) => ({
            id: p.id,
            src: p.image_url,
            title: p.title || 'Sans titre',
            category: p.category || 'portrait',
            description: p.model_name ? `Modèle: ${p.model_name}` : '',
            model_name: p.model_name || undefined,
            userId: p.user_id,
          }));

          // Merge: add any Supabase photos not already in allPhotos
          const existingIds = new Set(photos.map((p) => p.id));
          for (const sp of supaPhotos) {
            if (!existingIds.has(sp.id)) {
              photos.push(sp);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load model photos:', err);
      }

      setModelPhotos(photos);
      setIsLoading(false);

      // Load likes & comments per photo for UUID photos
      const isUuid = (v: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const uuidPhotos = photos.filter((p) => isUuid(p.id));

      if (uuidPhotos.length > 0) {
        try {
          const [likes, comments] = await Promise.all([
            Promise.all(uuidPhotos.map(async (p) => {
              try { const r = await fetch(`/api/likes?photoId=${p.id}`); const d = await r.json(); return [p.id, Number(d.count || 0)] as const; }
              catch { return [p.id, 0] as const; }
            })),
            Promise.all(uuidPhotos.map(async (p) => {
              try { const r = await fetch(`/api/comments?photoId=${p.id}`); const d = await r.json(); return [p.id, Array.isArray(d.comments) ? d.comments.length : 0] as const; }
              catch { return [p.id, 0] as const; }
            })),
          ]);
          const likeMap = Object.fromEntries(likes);
          const commentMap = Object.fromEntries(comments);
          setLikeCounts(likeMap);
          setCommentCounts(commentMap);
          setTotalLikes(Object.values(likeMap).reduce((sum, c) => sum + c, 0));
        } catch {
          setTotalLikes(0);
        }
      } else {
        setTotalLikes(0);
      }
      setLikesLoading(false);
    };

    loadPhotos();
  }, [isOpen, modelName, allPhotos]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          setSelectedPhotoIndex(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, selectedPhotoIndex]);

  const modelAvatar = useMemo(() => {
    if (modelPhotos.length === 0) return null;
    return modelPhotos[0].src;
  }, [modelPhotos]);

  const photoCount = modelPhotos.length;
  const videoCount = 0; // Videos not yet stored separately

  // Initials for avatar fallback
  const initials = modelName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[55] bg-black flex flex-col md:top-[80px]"
        >
          {/* ── Header ── */}
          <div className="flex-shrink-0 border-b border-white/10 bg-black/95 backdrop-blur-md">
            {/* Top bar with back arrow & name */}
            <div className="flex items-center gap-3 px-4 py-3">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.85 }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </motion.button>
              <h1 className="text-white font-bold text-lg truncate flex-1">{modelName}</h1>
            </div>

            {/* Profile section */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-pink-500/40 flex-shrink-0 bg-gradient-to-br from-pink-500/20 to-red-500/20">
                  {modelAvatar ? (
                    <NextImage
                      src={modelAvatar}
                      alt={modelName}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex-1 flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-white font-bold text-xl md:text-2xl">
                      {isLoading ? '—' : photoCount}
                    </p>
                    <p className="text-gray-400 text-xs">Photos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl md:text-2xl flex items-center justify-center gap-1">
                      {likesLoading ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        totalLikes
                      )}
                    </p>
                    <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
                      <Heart size={10} className="fill-pink-500 text-pink-500" />
                      J&apos;aime
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl md:text-2xl">{videoCount}</p>
                    <p className="text-gray-400 text-xs">Vidéos</p>
                  </div>
                </div>
              </div>

              {/* Model name display */}
              <div className="mt-3">
                <p className="text-white font-semibold text-sm">{modelName}</p>
                <p className="text-gray-500 text-xs mt-0.5">Modèle • Prime Studio</p>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-t border-white/10">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'photos' ? 'text-white' : 'text-gray-500'
                }`}
              >
                <Grid3X3 size={18} />
                <span className="hidden md:inline">Photos</span>
                {activeTab === 'photos' && (
                  <motion.div
                    layoutId="model-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'videos' ? 'text-white' : 'text-gray-500'
                }`}
              >
                <Film size={18} />
                <span className="hidden md:inline">Vidéos</span>
                {activeTab === 'videos' && (
                  <motion.div
                    layoutId="model-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'photos' ? (
              <>
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-px p-px">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : modelPhotos.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-3 gap-px p-px"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {modelPhotos.map((photo, index) => (
                      <motion.button
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03, duration: 0.25 }}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className="relative aspect-square overflow-hidden group cursor-pointer"
                      >
                        <NextImage
                          src={photo.src}
                          alt={photo.title || 'Photo'}
                          fill
                          sizes="33vw"
                          className="object-cover"
                          loading="lazy"
                        />
                        {/* Hover overlay with likes/comments */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                          {(likeCounts[photo.id] !== undefined || commentCounts[photo.id] !== undefined) ? (
                            <>
                              <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                                <Heart size={16} className="fill-white text-white" />
                                {likeCounts[photo.id] || 0}
                              </span>
                              <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                                <MessageCircle size={16} className="fill-white text-white" />
                                {commentCounts[photo.id] || 0}
                              </span>
                            </>
                          ) : (
                            <span className="text-white font-semibold text-xs text-center px-2 line-clamp-2">
                              {photo.title || 'Photo'}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Camera size={48} className="mb-3 opacity-40" />
                    <p className="text-sm">Aucune photo trouvée</p>
                  </div>
                )}
              </>
            ) : (
              /* Videos tab — placeholder */
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Film size={48} className="mb-3 opacity-40" />
                <p className="text-sm">Aucune vidéo pour le moment</p>
              </div>
            )}
          </div>

          {/* ── InstagramModal for photo viewing (portal to body) ── */}
          {typeof document !== 'undefined' && selectedPhotoIndex !== null && createPortal(
            <InstagramModal
              isOpen={true}
              photos={modelPhotos}
              currentIndex={selectedPhotoIndex ?? 0}
              onClose={() => setSelectedPhotoIndex(null)}
              onIndexChange={(index) => setSelectedPhotoIndex(index)}
              userId={userId || null}
            />,
            document.body
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
