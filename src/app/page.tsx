'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import ServicesGrid from '@/components/ServicesGrid';
import { ArrowRight, Camera, Sparkles } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

// Images locales (fallback)
const localGalleryImages = [
  '/images/267A1009.webp',
  '/images/267A1011.webp',
  '/images/267A1031.webp',
  '/images/267A1086.webp',
  '/images/267A1088.webp',
  '/images/267A1088_alt.webp',
  '/images/canon_eos_5d_mk3_160.webp',
  '/images/canon_eos_5d_mk3_161.webp',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export default function Home() {
  const [carouselImages, setCarouselImages] = useState<string[]>(localGalleryImages);
  const [loadingCarousel, setLoadingCarousel] = useState(true);

  // Charger les images Supabase + mélanger avec locales
  useEffect(() => {
    const loadImages = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data } = await supabase
          .from('photos')
          .select('image_url')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          // Combiner: Supabase en premier, puis images locales
          const supabaseUrls = data.map((p) => p.image_url);
          const mergedImages = [...supabaseUrls, ...localGalleryImages];
          setCarouselImages(mergedImages);
        } else {
          // Si pas de photos Supabase, utiliser locales
          setCarouselImages(localGalleryImages);
        }
      } catch (err) {
        console.error('Failed to load Supabase photos:', err);
        // Fallback aux images locales
        setCarouselImages(localGalleryImages);
      } finally {
        setLoadingCarousel(false);
      }
    };

    loadImages();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden pt-10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-pink-950/20 to-black -z-10" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl opacity-20 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <motion.div
            className="text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Title */}
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-pink-500/30 text-pink-400 text-sm font-medium">
                  <Camera size={16} />
                  Créateur d&apos;Images Professionnelles
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block text-gradient">Prime Studio</span>
                <span className="block text-white mt-2">À votre service</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Séances photos professionnelles spécialisées pour portraits, branding, et contenu créatif. Transformez votre image en Kinshasa.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link href="/store" className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir Notre Galerie
                  <ArrowRight size={20} />
                </motion.button>
              </Link>

              <Link href="/profile" className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Créer un Profil
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Gallery Preview */}
          <motion.div
            variants={itemVariants}
            className="mt-20 pt-20"
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Portfolio Récent</h2>
            {loadingCarousel ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <Carousel images={carouselImages} />
            )}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Une gamme complète de services photographiques professionnels adaptés à vos besoins
            </p>
          </motion.div>

          <ServicesGrid />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '500+', label: 'Clients Satisfaits' },
              { number: '1000+', label: 'Séances Réalisées' },
              { number: '5★', label: 'Note Moyenne' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center p-8 rounded-lg glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-950/30 to-red-950/30 -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">Prêt à Commencer?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Contactez-nous dès aujourd&apos;hui pour réserver votre séance et transformer votre vision en réalité.
            </p>

            <Link href="/contact">
              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg inline-flex items-center gap-2 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles size={20} />
                Commencer Maintenant
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
