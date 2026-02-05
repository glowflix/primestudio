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

export default function PrivacyPage() {
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
              Politique de Confidentialité
            </h1>
            <p className="text-gray-400 text-lg">
              Dernière mise à jour : février 2026
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">Introduction</h2>
            <p className="text-gray-300">
              Chez Prime Studio (&quot;nous&quot;, &quot;notre&quot;, &quot;nôtre&quot; ou &quot;Entreprise&quot;), nous nous engageons à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et sauvegardons vos informations lorsque vous visitez notre site web et nos services.
            </p>
          </motion.section>

          {/* 1. Informations Collectées */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Informations Que Nous Collectons</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Informations Personnelles</h3>
                <p>Nous collectons des informations que vous fournissez volontairement, notamment :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Nom et prénom</li>
                  <li>Adresse e-mail</li>
                  <li>Numéro de téléphone</li>
                  <li>Photos et contenu utilisateur</li>
                  <li>Messages et communications</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Informations Automatiques</h3>
                <p>Nous collectons automatiquement certaines informations via :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Adresse IP</li>
                  <li>Cookies et technologies similaires</li>
                  <li>Navigateur et appareil utilisé</li>
                  <li>Historique de navigation</li>
                  <li>Localisation approximative</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* 2. Utilisation des Données */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Utilisation De Vos Informations</h2>
            <p className="text-gray-300">Nous utilisons vos informations pour :</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Fournir, maintenir et améliorer nos services</li>
              <li>Traiter vos demandes et paiements</li>
              <li>Vous envoyer des mises à jour et des communications</li>
              <li>Personnaliser votre expérience</li>
              <li>Analyser les performances et l&apos;utilisation du site</li>
              <li>Détecter et prévenir la fraude</li>
              <li>Respecter nos obligations légales</li>
              <li>Contacter vous concernant votre commande ou demande</li>
            </ul>
          </motion.section>

          {/* 3. Partage des Données */}
          <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Partage De Vos Informations</h2>
            <p className="text-gray-300">
              Nous ne vendons, ne louons et ne divulguons pas vos informations personnelles à des tiers à des fins commerciales, sauf si vous nous en donnez la permission ou si cela est nécessaire pour :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Fournir les services que vous avez demandés</li>
              <li>Respecter la loi et les ordonnances judiciaires</li>
              <li>Protéger nos droits et la sécurité</li>
              <li>Partenaires de service (hébergement, email, analyse)</li>
            </ul>
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
