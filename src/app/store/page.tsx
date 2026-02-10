'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, Heart, MessageCircle, X, SlidersHorizontal, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import InstagramModal from '@/components/InstagramModal';
import ModelProfileModal from '@/components/ModelProfileModal';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase/client';

type StoreImage = {
  id: string;
  src: string;
  title: string;
  category: string;
  description: string;
  userId?: string;
  model_name?: string;
};

const galleryImages: StoreImage[] = [
  { id: '1', src: '/images/267A1009.webp', title: 'Séance Portrait', category: 'portrait', description: 'Portrait professionnel en studio' },
  { id: '2', src: '/images/267A1031.webp', title: 'Shooting Mode', category: 'fashion', description: 'Séance photo mode et style' },
  { id: '3', src: '/images/267A1086.webp', title: 'Branding Personnel', category: 'branding', description: 'Photos de branding personnel' },
  { id: '4', src: '/images/267A1088.webp', title: 'Portrait Créatif', category: 'portrait', description: 'Portrait avec effets créatifs' },
  { id: '5', src: '/images/267A1011.webp', title: 'Contenu Social', category: 'social', description: 'Photos pour réseaux sociaux' },
  { id: '6', src: '/images/canon_eos_5d_mk3_160.webp', title: 'Évènement', category: 'event', description: "Couverture d'événement" },
  { id: '7', src: '/images/canon_eos_5d_mk3_161.webp', title: 'Événement Spécial', category: 'event', description: "Couverture d'événement spécial" },
];

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'portrait', label: 'Portraits' },
  { id: 'fashion', label: 'Mode' },
  { id: 'event', label: 'Événements' },
  { id: 'branding', label: 'Branding' },
  { id: 'social', label: 'Social' },
];

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [localUser, setLocalUser] = useState<{ id: string } | null>(null);
  const [supabasePhotos, setSupabasePhotos] = useState<StoreImage[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState<string>('');

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => setLocalUser(user)).catch((err: unknown) => {
      if (err instanceof Error && err.name === 'AbortError') return;
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    const supabase = createSupabaseClient();
    const loadPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('id, image_url, title, category, model_name, active, user_id')
          .eq('active', true);
        if (ignore) return;
        if (error) { console.error('Error loading photos:', error.message); return; }
        if (data && data.length > 0) {
          setSupabasePhotos(data.map((p: { id: string; image_url: string; title: string | null; category: string | null; model_name: string | null; user_id?: string }) => ({
            id: p.id, src: p.image_url, title: p.title || 'Sans titre',
            category: p.category || 'portrait',
            description: p.model_name ? `Modèle: ${p.model_name}` : 'Photo de prime-studio',
            model_name: p.model_name || undefined, userId: p.user_id,
          })));
        }
      } catch (err: unknown) {
        if (ignore) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to load photos:', err);
      } finally { if (!ignore) setIsLoadingPhotos(false); }
    };
    loadPhotos();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const model = new URLSearchParams(window.location.search).get('model');
    if (model) { setModelFilter(model); setSearchTerm(model); }
  }, []);

  const filteredImages = useMemo(() => {
    const allImages = modelFilter ? [...supabasePhotos] : [...supabasePhotos, ...galleryImages];
    return allImages.filter((image) => {
      if (modelFilter) return (image.model_name || '').toLowerCase() === modelFilter.toLowerCase();
      const matchCategory = selectedCategory === 'all' || image.category === selectedCategory;
      const matchSearch =
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm, supabasePhotos, modelFilter]);

  useEffect(() => {
    const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    const loadCounts = async () => {
      const target = supabasePhotos.filter((p) => isUuid(p.id));
      if (target.length === 0) return;
      const [likes, comments] = await Promise.all([
        Promise.all(target.map(async (p) => {
          try { const r = await fetch(`/api/likes?photoId=${p.id}`); const d = await r.json(); return [p.id, Number(d.count || 0)] as const; }
          catch { return [p.id, 0] as const; }
        })),
        Promise.all(target.map(async (p) => {
          try { const r = await fetch(`/api/comments?photoId=${p.id}`); if (!r.ok) return [p.id, 0] as const; const d = await r.json(); return [p.id, Array.isArray(d.comments) ? d.comments.length : 0] as const; }
          catch { return [p.id, 0] as const; }
        })),
      ]);
      setLikeCounts(Object.fromEntries(likes));
      setCommentCounts(Object.fromEntries(comments));
    };
    loadCounts();
  }, [supabasePhotos]);

  const modelAvatar = useMemo(() => {
    if (!modelFilter) return null;
    return supabasePhotos.find((p) => (p.model_name || '').toLowerCase() === modelFilter.toLowerCase())?.src || null;
  }, [modelFilter, supabasePhotos]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Hero - Desktop only */}
      <section className="hidden md:block py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/30 to-red-950/30 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold">Notre Galerie</h1>
            <p className="text-lg text-gray-400">Découvrez nos meilleures créations</p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter — Sticky */}
      <section className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-full focus:border-pink-500 focus:outline-none transition-all text-white placeholder-gray-500 text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory !== 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 active:bg-white/20'
              }`}
            >
              <SlidersHorizontal size={14} />
              {selectedCategory === 'all' ? 'Filtrer' : categories.find(c => c.id === selectedCategory)?.label}
              {selectedCategory !== 'all' && (
                <span
                  onClick={(e) => { e.stopPropagation(); setSelectedCategory('all'); setShowFilterMenu(false); }}
                  className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                >
                  <X size={12} />
                </span>
              )}
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[180px]"
                  >
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.id); setShowFilterMenu(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {isActive && <Check size={14} className="text-pink-500" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Model filter header */}
          {modelFilter && (
            <div className="flex items-center gap-3 mb-4 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <button onClick={() => { setSelectedModelName(modelFilter); setShowModelModal(true); }} className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                {modelAvatar && <Image src={modelAvatar} alt={modelFilter} width={40} height={40} className="w-10 h-10 object-cover" />}
              </button>
              <div className="flex-1 min-w-0">
                <button onClick={() => { setSelectedModelName(modelFilter); setShowModelModal(true); }} className="text-left">
                  <p className="text-white font-semibold text-sm truncate">{modelFilter}</p>
                  <p className="text-gray-400 text-xs truncate">Galerie du modèle</p>
                </button>
              </div>
              <button onClick={() => { setModelFilter(null); setSearchTerm(''); }} className="text-xs text-white/70 hover:text-white transition px-3 py-1 rounded-full border border-white/15">
                Voir tout
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoadingPhotos ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-px md:gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredImages.length > 0 ? (
              <motion.div
                className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-px md:gap-0.5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory + searchTerm}
              >
                {filteredImages.map((image, index: number) => (
                    <motion.button
                      key={image.id}
                      variants={itemVariants}
                      onClick={() => setSelectedImageIndex(index)}
                      className="cursor-pointer group relative overflow-hidden aspect-square"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.src}
                          alt={image.title}
                          fill
                          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 25vw"
                          quality={70}
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Hover overlay — desktop only */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                        {(likeCounts[image.id] !== undefined || commentCounts[image.id] !== undefined) ? (
                          <>
                            <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                              <Heart size={16} className="fill-white text-white" />
                              {likeCounts[image.id] || 0}
                            </span>
                            <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                              <MessageCircle size={16} className="fill-white text-white" />
                              {commentCounts[image.id] || 0}
                            </span>
                          </>
                        ) : (
                          <span className="text-white font-semibold text-xs">{image.title}</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
              </motion.div>
            ) : (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-lg text-gray-400">Aucune photo trouvée</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Instagram Modal */}
      <InstagramModal
        isOpen={selectedImageIndex !== null}
        photos={filteredImages}
        currentIndex={selectedImageIndex ?? 0}
        onClose={() => setSelectedImageIndex(null)}
        onIndexChange={(index) => setSelectedImageIndex(index)}
        userId={localUser?.id || null}
      />

      {/* Model Profile Modal */}
      <ModelProfileModal
        isOpen={showModelModal}
        modelName={selectedModelName}
        onClose={() => setShowModelModal(false)}
        allPhotos={[...supabasePhotos, ...galleryImages]}
        userId={localUser?.id || null}
      />

      {/* CTA — Desktop only */}
      <section className="hidden md:block py-16 bg-gradient-to-r from-pink-950/30 to-red-950/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-4">
            <h2 className="text-3xl font-bold">Vous aimez nos travaux?</h2>
            <p className="text-gray-400">Contactez-nous pour réserver votre séance photo</p>
            <a href="/contact" className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition-all">
              Réserver
            </a>
          </motion.div>
        </div>
      </section>

      <div className="h-20 md:hidden" />
    </>
  );
}