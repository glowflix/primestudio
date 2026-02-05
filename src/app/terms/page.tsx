'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition">
            <ArrowLeft size={20} />
            Retour à l&apos;accueil
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              Conditions Générales D&apos;Utilisation
            </h1>
            <p className="text-gray-400 text-lg">
              Dernière mise à jour : février 2026
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">Introduction</h2>
            <p className="text-gray-300">
              Bienvenue chez Prime Studio. Ces Conditions Générales d&apos;Utilisation (&quot;Conditions&quot;, &quot;Accord&quot; ou &quot;Termes&quot;) régissent votre accès et votre utilisation de notre site web, de nos services et de nos produits.
            </p>
            <p className="text-gray-300">
              En accédant ou en utilisant Prime Studio, vous acceptez de respecter ces conditions. Si vous n&apos;acceptez pas l&apos;une quelconque de ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </motion.section>

          {/* 1. Services */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Nos Services</h2>
            <p className="text-gray-300">
              Prime Studio offre des services professionnels de photographie incluant séances photo, branding, contenu social et couverture d&apos;événements.
            </p>
            <p className="text-gray-300 mt-4">
              Nous nous réservons le droit de modifier, suspendre ou discontinuer tout ou partie de nos services à tout moment.
            </p>
          </motion.section>

          {/* 2. Accès et Compte */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Accès Et Compte Utilisateur</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Admissibilité</h3>
                <p>Vous devez avoir au moins 13 ans pour utiliser nos services. En acceptant ces conditions, vous déclarez avoir l&apos;âge légal requis.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Responsabilités</h3>
                <p>Vous êtes responsable de la confidentialité de vos identifiants et de toute activité sous votre compte.</p>
              </div>
            </div>
          </motion.section>

          {/* 3. Propriété Intellectuelle */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Propriété Intellectuelle</h2>
            <p className="text-gray-300">
              Tout le contenu du site est la propriété exclusive de Prime Studio. Les photos produites restent la propriété de Prime Studio sauf accord contraire écrit.
            </p>
          </motion.section>

          {/* 4. Restrictions */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Restrictions D&apos;Utilisation</h2>
            <p className="text-gray-300">Vous ne devez pas utiliser le site à des fins illégales, harceler d&apos;autres utilisateurs, ou tenter de contourner les mesures de sécurité.</p>
          </motion.section>

          {/* 5. Paiements */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Paiements Et Annulations</h2>
            <p className="text-gray-300">
              Le paiement doit être effectué avant la séance. Les annulations 48h avant sont remboursables. Moins de 48h : 50% facturisé. Jour même : non remboursable.
            </p>
          </motion.section>

          {/* 6. Limitation De Responsabilité */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Limitation De Responsabilité</h2>
            <p className="text-gray-300">
              Prime Studio n&apos;est pas responsable des dommages indirects. Notre responsabilité est limitée au montant payé.
            </p>
          </motion.section>

          {/* 7. Nous Contacter */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Nous Contacter</h2>
            <div className="space-y-2 text-gray-300 mt-4">
              <p><strong>Prime Studio</strong></p>
              <p>📍 Kinshasa, Gombé - RDC</p>
              <p>📱 +243 895 438 484</p>
              <p>📧 contact@primestudio.com</p>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div variants={itemVariants} className="text-center pt-8">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-300"
              >
                Retour à l&apos;accueil
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
