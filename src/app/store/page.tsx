'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import ImageModal from '@/components/ImageModal';
import Image from 'next/image';

const galleryImages = [
  {
    id: 1,
    src: '/images/267A1009.webp',
    title: 'Séance Portrait',
    category: 'portrait',
    description: 'Portrait professionnel en studio',
  },
  {
    id: 2,
    src: '/images/267A1031.webp',
    title: 'Shooting Mode',
    category: 'fashion',
    description: 'Séance photo mode et style',
  },
  {
    id: 3,
    src: '/images/267A1086.webp',
    title: 'Branding Personnel',
    category: 'branding',
    description: 'Photos de branding personnel',
  },
  {
    id: 4,
    src: '/images/267A1088.webp',
    title: 'Portrait Créatif',
    category: 'portrait',
    description: 'Portrait avec effets créatifs',
  },
  {
    id: 5,
    src: '/images/267A1011.webp',
    title: 'Contenu Social',
    category: 'social',
    description: 'Photos pour réseaux sociaux',
  },
  {
    id: 6,
    src: '/images/canon_eos_5d_mk3_160.webp',
    title: 'Évènement',
    category: 'event',
    description: 'Couverture d\'événement',
  },
  {
    id: 7,
    src: '/images/canon_eos_5d_mk3_161.webp',
    title: 'Événement Spécial',
    category: 'event',
    description: 'Couverture d\'événement spécial',
  },
];

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'portrait', label: 'Portraits' },
  { id: 'fashion', label: 'Mode' },
  { id: 'event', label: 'Événements' },
];

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const imagesList = galleryImages.map((img) => img.src);

  const filteredImages = useMemo(() => {
    return galleryImages.filter((image) => {
      const matchCategory = selectedCategory === 'all' || image.category === selectedCategory;
      const matchSearch =
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  return (
    <>
      {/* Hero Section - Hidden on mobile, shown on desktop */}
      <section className="hidden md:block py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/30 to-red-950/30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold">Notre Galerie</h1>
            <p className="text-lg text-gray-400">
              Découvrez nos meilleures créations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section - STICKY AT TOP */}
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
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full focus:border-pink-500 focus:outline-none transition-all text-white placeholder-gray-500 text-sm"
            />
          </div>

          {/* Category Filters - Compact horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'bg-white/10 text-gray-300 active:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid - 2 COLUMNS ON MOBILE */}
      <section className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filteredImages.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory + searchTerm}
              >
                {filteredImages.map((image) => {
                  const globalIndex = galleryImages.findIndex((img) => img.id === image.id);
                  return (
                    <motion.button
                      key={image.id}
                      variants={itemVariants}
                      onClick={() => handleImageClick(globalIndex)}
                      className="cursor-pointer group relative overflow-hidden rounded-md md:rounded-xl aspect-square"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.src}
                          alt={image.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          quality={70}
                          priority={false}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Overlay - Only on hover/desktop */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-4">
                        <h3 className="text-sm md:text-lg font-bold text-white line-clamp-1">{image.title}</h3>
                        <p className="text-gray-200 text-xs hidden md:block line-clamp-1">{image.description}</p>
                      </div>

                      {/* Category Tag - Hidden on mobile */}
                      <div className="hidden md:block absolute top-2 right-2 px-2 py-0.5 bg-pink-500/90 text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.category}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-lg text-gray-400">Aucune photo trouvée</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImageIndex !== null}
        images={imagesList}
        currentIndex={selectedImageIndex ?? 0}
        onClose={() => setSelectedImageIndex(null)}
        onIndexChange={(index) => setSelectedImageIndex(index)}
      />

      {/* CTA Section - Hidden on mobile */}
      <section className="hidden md:block py-16 bg-gradient-to-r from-pink-950/30 to-red-950/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold">Vous aimez nos travaux?</h2>
            <p className="text-gray-400">
              Contactez-nous pour réserver votre séance photo
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition-all"
            >
              Réserver
            </a>
          </motion.div>
        </div>
      </section>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}
