'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Play } from 'lucide-react';

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

const videos = [
  {
    id: 'SU82r31rgTg',
    title: 'Clip Studio Prime',
    description: 'Découvrez nos meilleures séances photos en action',
  },
];

export default function VideosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden pt-10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-pink-950/20 to-black -z-10" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl opacity-20 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
          <motion.div
            className="text-center space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-pink-500/30 text-pink-400 text-sm font-medium">
                  <Play size={16} />
                  Nos Clips Vidéo
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="block text-gradient">Galerie Vidéo</span>
                <span className="block text-white mt-2">Prime Studio</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Regardez nos meilleurs moments et découvrez notre travail en action
              </p>
            </motion.div>

            {/* Videos Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16"
              variants={containerVariants}
            >
              {videos.map((video, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <motion.div
                    className="relative rounded-xl overflow-hidden bg-black/50 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(236, 72, 153, 0.8)' }}
                  >
                    {/* YouTube Embed */}
                    <div className="aspect-video w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>

                    {/* Overlay Info */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                      whileHover={{ opacity: 1 }}
                    >
                      <h3 className="text-white font-bold text-lg">{video.title}</h3>
                      <p className="text-gray-300 text-sm">{video.description}</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional Info */}
            <motion.div
              variants={itemVariants}
              className="mt-16 p-8 rounded-xl bg-white/5 border border-pink-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Plus de contenu à venir</h2>
              <p className="text-gray-400">
                Suivez-nous pour découvrir régulièrement de nouveaux clips et coulisses de nos séances photos.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Spacer for mobile footer */}
      <div className="h-20" />
    </>
  );
}
