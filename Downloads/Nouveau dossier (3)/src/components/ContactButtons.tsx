'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Phone, MapPin, Globe } from 'lucide-react';

interface ContactButtonsProps {
  phoneNumber: string;
  whatsappUrl: string;
}

export default function ContactButtons({ phoneNumber, whatsappUrl }: ContactButtonsProps) {
  const buttons = [
    {
      icon: MessageCircle,
      label: `WhatsApp: ${phoneNumber}`,
      href: whatsappUrl,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
    },
    {
      icon: Phone,
      label: `Appel: ${phoneNumber}`,
      href: `tel:${phoneNumber}`,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
    },
    {
      icon: MapPin,
      label: 'Localisation',
      href: 'https://maps.google.com/?q=Kinshasa,Gombe',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-600 to-red-700',
    },
    {
      icon: Globe,
      label: 'Visiter le Site',
      href: 'https://prime-studio.vercel.app',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {buttons.map((button, index) => {
        const Icon = button.icon;
        return (
          <motion.a
            key={index}
            href={button.href}
            target={button.label.includes('Appel') ? undefined : '_blank'}
            rel={button.label.includes('Appel') ? undefined : 'noopener noreferrer'}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center w-full bg-gradient-to-r ${button.gradient} hover:${button.hoverGradient} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300`}
          >
            <Icon size={20} className="mr-2" />
            {button.label}
          </motion.a>
        );
      })}
    </motion.div>
  );
}
