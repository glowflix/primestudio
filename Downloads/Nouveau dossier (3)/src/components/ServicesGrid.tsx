'use client';

import { motion } from 'framer-motion';
import { Users, Camera, Palette, Sparkles, TrendingUp, Zap } from 'lucide-react';

const services = [
  {
    icon: Users,
    title: 'Portraits Professionnels',
    description: 'Photos d\'identité et portraits premium',
  },
  {
    icon: Camera,
    title: 'Photos Artistiques',
    description: 'Shooting créatif et personnel',
  },
  {
    icon: Palette,
    title: 'Branding & Réseaux',
    description: 'Contenu visuel pour vos plateformes',
  },
  {
    icon: Sparkles,
    title: 'Maquillage & Stylisme',
    description: 'Préparation professionnelle',
  },
  {
    icon: TrendingUp,
    title: 'Contenu Digital',
    description: 'Vidéos et photos pour entrepreneurs',
  },
  {
    icon: Zap,
    title: 'Packages Premium',
    description: 'Forfaits spécialisés sur mesure',
  },
];

export default function ServicesGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-red-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/5 backdrop-blur border border-white/10 hover:border-pink-600/50 rounded-xl p-6 transition-all duration-500">
              <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
