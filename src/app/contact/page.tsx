'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Loader, User, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

// Manager WhatsApp number
const MANAGER_PHONE = '+243834068617';
const MANAGER_EMAIL = 'noverliecg@gmail.com';

// Service types for pre-message
const serviceTypes = [
  { id: 'portrait', label: '📸 Séance Portrait', price: 'À partir de $50' },
  { id: 'event', label: '🎉 Couverture Événement', price: 'À partir de $150' },
  { id: 'branding', label: '💼 Branding & Entreprise', price: 'À partir de $100' },
  { id: 'social', label: '📱 Contenu Social Media', price: 'À partir de $75' },
  { id: 'other', label: '✨ Autre demande', price: 'Sur devis' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [step, setStep] = useState(1);

  // Auto-fill email if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
          setUserLoggedIn(true);
        }
      } catch {
        // Not logged in, continue
      }
    };
    checkUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate WhatsApp pre-message
  const generateWhatsAppMessage = () => {
    const serviceName = serviceTypes.find(s => s.id === formData.service)?.label || 'Service';
    const message = `🎨 *Nouvelle demande Prime Studio*

👤 *Nom:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Téléphone:* ${formData.phone}

📸 *Service demandé:* ${serviceName}
💰 *Budget estimé:* ${formData.budget || 'Non spécifié'}

💬 *Message:*
${formData.message}

---
_Envoyé depuis primestudios.store_`;
    
    return encodeURIComponent(message);
  };

  // Send to WhatsApp
  const sendToWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${MANAGER_PHONE.replace(/[+\s]/g, '')}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Open WhatsApp with pre-filled message
      sendToWhatsApp();
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setStep(1);
        setFormData({ name: '', email: userLoggedIn ? formData.email : '', phone: '', service: '', budget: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      value: '+243 834 068 617',
      link: 'tel:+243834068617',
      color: 'from-green-500/20 to-emerald-500/20',
      hoverColor: 'group-hover:text-green-400',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: 'Réponse rapide',
      link: `https://wa.me/${MANAGER_PHONE.replace(/[+\s]/g, '')}?text=${encodeURIComponent('Bonjour Prime Studio! Je voudrais en savoir plus sur vos services.')}`,
      color: 'from-green-500/20 to-green-600/20',
      hoverColor: 'group-hover:text-green-400',
    },
    {
      icon: Mail,
      title: 'Email',
      value: MANAGER_EMAIL,
      link: `mailto:${MANAGER_EMAIL}`,
      color: 'from-pink-500/20 to-red-500/20',
      hoverColor: 'group-hover:text-pink-400',
    },
    {
      icon: MapPin,
      title: 'Studio',
      value: 'Kinshasa, Gombé',
      link: 'https://maps.google.com/?q=Kinshasa,Gombe',
      color: 'from-blue-500/20 to-cyan-500/20',
      hoverColor: 'group-hover:text-blue-400',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/30 via-black to-red-950/30 -z-10" />
        
        {/* Animated background particles */}
        <div className="absolute inset-0 -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-pink-500/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium mb-4"
            >
              <Sparkles size={16} />
              Réponse sous 24h garantie
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
              Contactez-nous
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Discutons de votre projet photo et créons ensemble des images exceptionnelles
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
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
                  className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition-all duration-300 group"
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${method.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`text-white ${method.hoverColor} transition-colors`} size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold mb-1">{method.title}</h3>
                      <p className={`text-xs md:text-sm text-gray-400 ${method.hoverColor} transition-colors`}>
                        {method.value}
                      </p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form - Multi-step */}
      <section className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-3xl p-6 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-gradient-to-r from-pink-500 to-red-500' : 
                    s < step ? 'w-2 bg-pink-500' : 'w-2 bg-white/20'
                  }`}
                  animate={{ scale: s === step ? 1.1 : 1 }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="text-green-400" size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">Message envoyé! 🎉</h3>
                  <p className="text-gray-400 mb-4">
                    Votre demande a été transmise au manager via WhatsApp.
                  </p>
                  <p className="text-sm text-gray-500">
                    Une copie a été envoyée à <span className="text-pink-400">{formData.email}</span>
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Vos informations</h2>
                        <p className="text-gray-400 text-sm">Commençons par faire connaissance</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">
                            <User size={14} className="inline mr-2" />
                            Nom complet
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:bg-white/10 transition-all"
                            placeholder="Votre nom"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">
                            <Mail size={14} className="inline mr-2" />
                            Email {userLoggedIn && <span className="text-green-400 text-xs">(auto-rempli)</span>}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            readOnly={userLoggedIn}
                            className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:bg-white/10 transition-all ${userLoggedIn ? 'text-green-400 cursor-not-allowed' : ''}`}
                            placeholder="votre@email.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">
                            <Phone size={14} className="inline mr-2" />
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:bg-white/10 transition-all"
                            placeholder="+243 XXX XXX XXX"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!formData.name || !formData.email || !formData.phone}
                        className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continuer →
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: Service Selection */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Votre projet</h2>
                        <p className="text-gray-400 text-sm">Quel service vous intéresse?</p>
                      </div>

                      <div className="space-y-3">
                        {serviceTypes.map((service) => (
                          <motion.label
                            key={service.id}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                              formData.service === service.id
                                ? 'bg-pink-500/20 border-pink-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="service"
                                value={service.id}
                                checked={formData.service === service.id}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <span className="text-lg">{service.label}</span>
                            </div>
                            <span className="text-sm text-gray-400">{service.price}</span>
                          </motion.label>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          💰 Budget estimé (optionnel)
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:bg-white/10 transition-all text-white"
                        >
                          <option value="" className="bg-black">Sélectionnez...</option>
                          <option value="< $50" className="bg-black">Moins de $50</option>
                          <option value="$50-100" className="bg-black">$50 - $100</option>
                          <option value="$100-200" className="bg-black">$100 - $200</option>
                          <option value="$200-500" className="bg-black">$200 - $500</option>
                          <option value="> $500" className="bg-black">Plus de $500</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ← Retour
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={!formData.service}
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Continuer →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Message */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Votre message</h2>
                        <p className="text-gray-400 text-sm">Décrivez votre projet en détail</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          💬 Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:bg-white/10 transition-all resize-none"
                          placeholder="Décrivez votre projet, la date souhaitée, le lieu, etc..."
                        />
                      </div>

                      {/* Preview */}
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle size={16} className="text-green-400" />
                          <span className="text-sm font-medium text-green-400">Aperçu WhatsApp</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Votre message sera envoyé au manager via WhatsApp avec toutes vos informations.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ← Retour
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting || !formData.message}
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              Envoyer via WhatsApp
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20">
                  <Clock className="text-pink-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Horaires</h2>
              </div>
              <div className="space-y-3 text-gray-400">
                <p className="flex justify-between py-2 border-b border-white/5">
                  <span>Lundi - Vendredi</span>
                  <span className="text-white font-medium">9:00 - 18:00</span>
                </p>
                <p className="flex justify-between py-2 border-b border-white/5">
                  <span>Samedi</span>
                  <span className="text-white font-medium">10:00 - 16:00</span>
                </p>
                <p className="flex justify-between py-2">
                  <span>Dimanche</span>
                  <span className="text-pink-400 font-medium">Sur RDV</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <MessageCircle className="text-green-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Réponse rapide</h2>
              </div>
              <div className="space-y-4 text-gray-400">
                <p>
                  Nous répondons à tous les messages dans les{' '}
                  <span className="text-white font-semibold">24 heures</span>.
                </p>
                <p>
                  Pour les demandes urgentes, contactez directement notre manager au{' '}
                  <a href={`tel:${MANAGER_PHONE}`} className="text-green-400 font-semibold hover:underline">
                    +243 834 068 617
                  </a>
                </p>
                <motion.a
                  href={`https://wa.me/${MANAGER_PHONE.replace(/[+\s]/g, '')}?text=${encodeURIComponent('Bonjour! Je voudrais discuter rapidement.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle size={16} />
                  WhatsApp Direct
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
