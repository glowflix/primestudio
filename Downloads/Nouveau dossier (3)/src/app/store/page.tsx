'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import ImageModal from '@/components/ImageModal';

const galleryImages = [
  {
    id: 1,
    src: '/images/267A1009.jpg',
    title: 'Séance Portrait',
    category: 'portrait',
    description: 'Portrait professionnel en studio',
  },
  {
    id: 2,
    src: '/images/267A1031.jpg',
    title: 'Shooting Mode',
    category: 'fashion',
    description: 'Séance photo mode et style',
  },
  {
    id: 3,
    src: '/images/267A1086.jpg',
    title: 'Branding Personnel',
    category: 'branding',
    description: 'Photos de branding personnel',
  },
  {
    id: 4,
    src: '/images/267A1088.jpg',
    title: 'Portrait Créatif',
    category: 'portrait',
    description: 'Portrait avec effets créatifs',
  },
  {
    id: 5,
    src: '/images/Canon EOS 5D Mark III160.jpg',
    title: 'Contenu Social',
    category: 'social',
    description: 'Photos pour réseaux sociaux',
  },
  {
    id: 6,
    src: '/images/Canon EOS 5D Mark III161_1.jpg',
    title: 'Évènement',
    category: 'event',
    description: 'Couverture d\'événement',
  },
];

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'portrait', label: 'Portraits' },
  { id: 'fashion', label: 'Mode' },
  { id: 'branding', label: 'Branding' },
  { id: 'social', label: 'Social Media' },
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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/30 to-red-950/30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold">Notre Galerie</h1>
            <p className="text-xl text-gray-400">
              Découvrez nos meilleures créations et projets réalisés
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 sticky top-20 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <motion.div
            className="mb-8 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une photo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-white placeholder-gray-500"
            />
          </motion.div>

          {/* Category Filters */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filteredImages.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory + searchTerm}
              >
                {filteredImages.map((image) => {
                  const globalIndex = galleryImages.findIndex((img) => img.id === image.id);
                  return (
                    <motion.div
                      key={image.id}
                      variants={itemVariants}
                      onClick={() => setSelectedImageIndex(globalIndex)}
                      className="cursor-pointer group relative overflow-hidden rounded-xl aspect-square"
                    >
                    {/* Image */}
                    <div className="relative w-full h-full bg-white/5 overflow-hidden rounded-xl">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{image.title}</h3>
                        <p className="text-gray-200 text-sm">{image.description}</p>
                      </div>

                      {/* Click indicator */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-medium"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          Voir plus
                        </motion.div>
                      </div>
                    </div>

                      {/* Category Tag */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {image.category}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-xl text-gray-400">Aucune photo trouvée</p>
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
        onIndexChange={setSelectedImageIndex}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-950/30 to-red-950/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">Vous aimez nos travaux?</h2>
            <p className="text-gray-400 text-lg">
              Contactez-nous pour réserver votre séance photo aujourd'hui
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-300"
            >
              Réserver Maintenant
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
