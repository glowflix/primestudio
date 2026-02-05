'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

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

  const contactMethods = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+243 895 438 484',
      link: 'tel:+243895438484',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@primestudio.cd',
      link: 'mailto:contact@primestudio.cd',
    },
    {
      icon: MapPin,
      title: 'Localisation',
      value: 'Kinshasa, Gombé',
      link: 'https://maps.google.com/?q=Kinshasa,Gombe',
    },
  ];

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
            <h1 className="text-5xl md:text-6xl font-bold">Nous Contacter</h1>
            <p className="text-xl text-gray-400">
              Envoyez-nous vos questions et nous vous répondrons rapidement
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={index}
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="p-8 rounded-xl glass hover:bg-white/10 transition-all duration-300 group"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-gradient" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                    <p className="text-gray-400 hover:text-white transition-colors">
                      {method.value}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="glass rounded-2xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Envoyez-nous un message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="Votre nom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="+243 895 438 484"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2">Sujet</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="Raison de votre contact"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={20} />
                Envoyer le Message
              </motion.button>

              {/* Success Message */}
              {submitted && (
                <motion.div
                  className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ✓ Message envoyé avec succès!
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Horaires d&apos;Ouverture</h2>
              <div className="space-y-4 text-gray-400">
                <p className="flex justify-between"><span>Lundi - Vendredi</span> <span className="text-white">9:00 - 18:00</span></p>
                <p className="flex justify-between"><span>Samedi</span> <span className="text-white">10:00 - 16:00</span></p>
                <p className="flex justify-between"><span>Dimanche</span> <span className="text-white">Sur rendez-vous</span></p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Temps de Réponse</h2>
              <div className="space-y-4 text-gray-400">
                <p>Nous nous efforçons de répondre à tous les messages dans les <span className="text-white font-semibold">24 heures</span> suivantes.</p>
                <p>Pour les demandes urgentes, appelez-nous directement au <span className="text-pink-400 font-semibold">+243 895 438 484</span>.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
