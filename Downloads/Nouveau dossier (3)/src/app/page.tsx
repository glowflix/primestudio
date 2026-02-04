'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import Carousel from '@/components/Carousel';
import ServicesGrid from '@/components/ServicesGrid';
import ContactButtons from '@/components/ContactButtons';
import { Download } from 'lucide-react';

// Galerie d'images depuis le dossier public
const galleryImages = [
  '/images/267A1009.jpg',
  '/images/267A1031.jpg',
  '/images/267A1086.jpg',
  '/images/267A1088.jpg',
  '/images/Canon EOS 5D Mark III160.jpg',
  '/images/Canon EOS 5D Mark III161_1.jpg',
];

export default function Home() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('https://prime-studio.vercel.app');

  useEffect(() => {
    setCurrentPageUrl(typeof window !== 'undefined' ? window.location.href : 'https://prime-studio.vercel.app');
  }, []);

  const phoneNumber = "+243895438484";
  const whatsappMessage = "Bonjour! Je suis intéressé par les services de Prime Studio.";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  const downloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas') as HTMLCanvasElement;
      const url = canvas?.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prime-studio-qr.png';
      link.click();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        className="max-w-6xl mx-auto px-4 py-12 md:py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Hero */}
        <motion.div className="text-center mb-16 md:mb-24" variants={itemVariants}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-2">
              PRIME <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">STUDIO</span>
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400 mb-2 font-light"
          >
            Campagne Promotionnelle Spéciale
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 w-20 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-4 origin-left"
          />
          <motion.p variants={itemVariants} className="text-gray-500 text-sm">
            Kinshasa • Gombé • Séances Photos Professionnelles
          </motion.p>
        </motion.div>

        {/* Carousel Gallery */}
        <motion.div className="mb-20" variants={itemVariants}>
          <h2 className="text-2xl md:text-3xl font-light text-white mb-8 text-center">
            Galerie de nos réalisations
          </h2>
          <Carousel images={galleryImages} autoplay interval={4000} />
        </motion.div>

        {/* Services Grid */}
        <motion.div className="mb-20" variants={itemVariants}>
          <h2 className="text-2xl md:text-3xl font-light text-white mb-12 text-center">
            Nos Services
          </h2>
          <ServicesGrid />
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border border-white/10 rounded-2xl p-8 md:p-12 mb-20"
          variants={itemVariants}
        >
          <h2 className="text-2xl md:text-3xl font-light text-white mb-8 text-center">
            Nous Contacter
          </h2>
          <ContactButtons phoneNumber={phoneNumber} whatsappUrl={whatsappUrl} />
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border border-white/10 rounded-2xl p-8 md:p-12 mb-12"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* QR Code */}
            <motion.div
              className="flex-1 flex flex-col items-center"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-gray-300 text-sm mb-6 font-light">Scannez pour accéder directement</p>
              <div
                ref={qrRef}
                className="bg-white p-6 rounded-xl shadow-2xl"
              >
                <QRCode
                  value={currentPageUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#be123c"
                />
              </div>
              <motion.button
                onClick={downloadQR}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
              >
                <Download size={18} />
                Télécharger QR Code
              </motion.button>
            </motion.div>

            {/* Info Text */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Comment ça marche?</h3>
              <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-pink-600 font-bold">1.</span>
                  <span>Scannez le QR Code avec votre téléphone</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-600 font-bold">2.</span>
                  <span>Vous accédez directement à notre page de contact</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-600 font-bold">3.</span>
                  <span>Cliquez sur l&apos;un de nos boutons de contact</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-600 font-bold">4.</span>
                  <span>Connectez-vous avec nous via WhatsApp, appel ou email</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center border-t border-white/10 pt-12"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-sm font-light mb-2">
            © 2026 Prime Studio • Tous droits réservés
          </p>
          <p className="text-gray-600 text-xs">
            Photographie professionnelle • Branding • Contenu Digital
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
