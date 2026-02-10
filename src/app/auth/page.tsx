'use client';

import { useEffect, useState, useRef } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mail, Loader, Eye, EyeOff, Sparkles, Shield, Camera, CheckCircle, X, ArrowRight, Lock, Phone, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

// ─── Auth modes ───
type AuthMode = 'email' | 'phone' | 'google';

// ─── Background visuals ───
const ParticleField = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(236,72,153,${0.3 + Math.random() * 0.4}), transparent)`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 60 - 30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

const PulsingRings = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-2xl border border-pink-500/20"
        style={{ width: `${100 + i * 30}%`, height: `${100 + i * 30}%` }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.1, 0.8], rotate: [0, 90, 0] }}
        transition={{ duration: 4, delay: i * 1.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const GlowOrb = ({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{ width: size, height: size, left: x, top: y, background: color }}
    animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15], x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

// ─── Mode configs ───
const AUTH_MODES: { mode: AuthMode; label: string; icon: React.ReactNode; color: string }[] = [
  { mode: 'email', label: 'Email', icon: <Mail size={16} />, color: 'from-pink-500 to-red-500' },
  { mode: 'phone', label: 'Téléphone', icon: <Phone size={16} />, color: 'from-blue-500 to-cyan-500' },
  { mode: 'google', label: 'Google', icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ), color: 'from-white/10 to-white/5' },
];

export default function LoginPage() {
  const router = useRouter();

  // ─── Auth mode state ───
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [isLogin, setIsLogin] = useState(true);

  // ─── Email mode ───
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ─── Phone mode ───
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // ─── General ───
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ─── Mouse tracking for card tilt (desktop) ───
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  // ─── Init Supabase ───
  useEffect(() => {
    try {
      const client = createSupabaseClient();
      setSupabase(client);
      client.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
        if (data.session) router.push('/profile');
      }).catch((err: Error) => {
        if (err?.name !== 'AbortError') console.error(err);
      });
    } catch {
      setError('Configuration en cours...');
    }
  }, [router]);

  // ─── OTP Countdown timer ───
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // ─── Error translations ───
  const translateError = (err: string): string => {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Email non confirmé. Vérifiez votre boîte mail.',
      'User already registered': 'Cet email est déjà utilisé',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Invalid email': "Format d'email invalide",
      'Phone number is required': 'Numéro de téléphone requis',
      'Invalid phone number': 'Numéro de téléphone invalide',
      'Token has expired or is invalid': 'Code expiré ou invalide',
      'OTP has expired': 'Le code OTP a expiré. Renvoyez un nouveau code.',
    };
    return translations[err] || err;
  };

  // ─── Clear form on mode change ───
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMessage('');
    setShowNotification(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpCountdown(0);
    if (mode === 'google') {
      handleGoogleAuth();
    }
  };

  // ═══════════════════════════════════
  // EMAIL/PASSWORD AUTH
  // ═══════════════════════════════════
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Service en cours de chargement');
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setSuccessMessage('Connexion réussie!');
        setShowNotification(true);
        setTimeout(() => router.push('/profile'), 1500);
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        setSuccessMessage('Compte créé! Vérifiez votre email.');
        setShowNotification(true);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : 'Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════
  // PHONE OTP AUTH
  // ═══════════════════════════════════
  const formatPhoneForDisplay = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const normalizePhone = (phone: string) => {
    let cleaned = phone.replace(/\s/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+33' + cleaned.substring(1);
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Service en cours de chargement');
      const phone = normalizePhone(phoneNumber);
      const { error: err } = await supabase.auth.signInWithOtp({ phone });
      if (err) throw err;
      setOtpSent(true);
      setOtpCountdown(60);
      setSuccessMessage(`Code envoyé au ${phone}`);
      setShowNotification(true);
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : "Erreur d'envoi du SMS"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Service en cours de chargement');
      const phone = normalizePhone(phoneNumber);
      const { error: err } = await supabase.auth.verifyOtp({
        phone,
        token: otpCode,
        type: 'sms',
      });
      if (err) throw err;
      setSuccessMessage('Connexion réussie!');
      setShowNotification(true);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : 'Code invalide'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    await handleSendOtp();
  };

  // ═══════════════════════════════════
  // GOOGLE AUTH
  // ═══════════════════════════════════
  const handleGoogleAuth = async () => {
    setError('');
    setIsLoadingGoogle(true);
    try {
      if (!supabase) throw new Error('Service en cours de chargement');
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion Google');
      setIsLoadingGoogle(false);
    }
  };

  // ─── Input animation variants ───
  const inputVariants = {
    idle: { borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 0 rgba(236,72,153,0)' },
    focused: { borderColor: 'rgba(236,72,153,0.5)', boxShadow: '0 0 25px 0 rgba(236,72,153,0.12)' },
  };

  const phoneInputVariants = {
    idle: { borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
    focused: { borderColor: 'rgba(59,130,246,0.5)', boxShadow: '0 0 25px 0 rgba(59,130,246,0.12)' },
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* ═══ Multi-layer animated background ═══ */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.08),transparent_50%)]" />
      </div>

      <GlowOrb color="rgba(236,72,153,0.2)" size={400} x="-10%" y="10%" delay={0} />
      <GlowOrb color="rgba(239,68,68,0.15)" size={300} x="70%" y="60%" delay={2} />
      <GlowOrb color="rgba(168,85,247,0.12)" size={350} x="40%" y="-10%" delay={4} />

      <ParticleField />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(236,72,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ═══ Main content ═══ */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5 sm:space-y-8"
        >
          {/* ═══ Logo & Header ═══ */}
          <motion.div className="text-center space-y-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
              <PulsingRings />
              <motion.div
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-pink-500/30"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(236,72,153,0.3)',
                    '0 0 60px rgba(236,72,153,0.5)',
                    '0 0 30px rgba(236,72,153,0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Camera className="text-white w-9 h-9 sm:w-11 sm:h-11" />
                <motion.div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                  />
                </motion.div>
              </motion.div>
            </div>

            <motion.h1
              className="text-3xl sm:text-5xl font-black tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                Prime Studio
              </span>
            </motion.h1>
            <motion.p
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Choisissez votre méthode de connexion
            </motion.p>
          </motion.div>

          {/* ═══════════════════════════════════════════ */}
          {/* AUTH MODE SELECTOR — 3 Pills                */}
          {/* ═══════════════════════════════════════════ */}
          <motion.div
            className="flex bg-white/[0.04] rounded-2xl p-1 border border-white/10 backdrop-blur-sm gap-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {AUTH_MODES.map(({ mode, label, icon }) => {
              const isActive = authMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="authModeToggle"
                      className={`absolute inset-0 rounded-xl ${
                        mode === 'email'
                          ? 'bg-gradient-to-r from-pink-500 to-red-500'
                          : mode === 'phone'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-white/10'
                      }`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {icon}
                    {label}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* ═══ Card with 3D tilt ═══ */}
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <AnimatePresence mode="wait">
              {/* ═══════════ EMAIL MODE ═══════════ */}
              {authMode === 'email' && (
                <motion.div
                  key="email-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden"
                >
                  {/* Animated border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(236,72,153,0.12), transparent 60%, rgba(239,68,68,0.05))',
                        'linear-gradient(225deg, rgba(236,72,153,0.05), transparent 60%, rgba(239,68,68,0.12))',
                        'linear-gradient(45deg, rgba(236,72,153,0.12), transparent 60%, rgba(239,68,68,0.05))',
                      ],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="relative z-10">
                    {/* Login / Signup toggle */}
                    <div className="flex justify-center mb-6">
                      <div className="inline-flex bg-white/5 rounded-xl p-0.5 border border-white/10">
                        {['Connexion', 'Inscription'].map((label, i) => {
                          const active = i === 0 ? isLogin : !isLogin;
                          return (
                            <button
                              key={label}
                              onClick={() => { setIsLogin(i === 0); setError(''); setSuccessMessage(''); setShowNotification(false); }}
                              className={`relative px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="emailToggle"
                                  className="absolute inset-0 bg-white/10 rounded-lg"
                                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notifications */}
                    <NotificationBanner
                      showNotification={showNotification}
                      successMessage={successMessage}
                      error={error}
                      onCloseNotification={() => setShowNotification(false)}
                    />

                    {/* Email Form */}
                    <form ref={formRef} onSubmit={handleEmailAuth} className="space-y-4">
                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300 ml-1">Email</label>
                        <motion.div
                          className="relative rounded-xl border"
                          variants={inputVariants}
                          animate={focusedField === 'email' ? 'focused' : 'idle'}
                        >
                          <motion.div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            animate={{ color: focusedField === 'email' ? '#ec4899' : '#6b7280', scale: focusedField === 'email' ? 1.1 : 1 }}
                          >
                            <Mail size={18} />
                          </motion.div>
                          <input
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all duration-300 text-sm sm:text-base"
                          />
                        </motion.div>
                      </div>

                      {/* Password input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300 ml-1">Mot de passe</label>
                        <motion.div
                          className="relative rounded-xl border"
                          variants={inputVariants}
                          animate={focusedField === 'password' ? 'focused' : 'idle'}
                        >
                          <motion.div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            animate={{ color: focusedField === 'password' ? '#ec4899' : '#6b7280', scale: focusedField === 'password' ? 1.1 : 1 }}
                          >
                            <Lock size={18} />
                          </motion.div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            minLength={6}
                            className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all duration-300 text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-1"
                          >
                            <motion.div key={showPassword ? 'h' : 's'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </motion.div>
                          </button>
                        </motion.div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-[length:200%_auto] hover:bg-right disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 relative overflow-hidden group mt-2"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        {isLoading ? (
                          <>
                            <Loader size={20} className="animate-spin" />
                            <span>{isLogin ? 'Connexion...' : 'Création...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>{isLogin ? 'Se connecter' : 'Créer mon compte'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ═══════════ PHONE MODE ═══════════ */}
              {authMode === 'phone' && (
                <motion.div
                  key="phone-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden"
                >
                  {/* Animated border glow - blue */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(59,130,246,0.12), transparent 60%, rgba(6,182,212,0.05))',
                        'linear-gradient(225deg, rgba(59,130,246,0.05), transparent 60%, rgba(6,182,212,0.12))',
                        'linear-gradient(45deg, rgba(59,130,246,0.12), transparent 60%, rgba(6,182,212,0.05))',
                      ],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="relative z-10">
                    {/* Phone icon header */}
                    <div className="text-center mb-6">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Phone className="text-white" size={24} />
                      </motion.div>
                      <p className="text-gray-400 text-sm">
                        {otpSent
                          ? 'Entrez le code reçu par SMS'
                          : 'Connectez-vous avec votre numéro'}
                      </p>
                    </div>

                    {/* Notifications */}
                    <NotificationBanner
                      showNotification={showNotification}
                      successMessage={successMessage}
                      error={error}
                      onCloseNotification={() => setShowNotification(false)}
                    />

                    <AnimatePresence mode="wait">
                      {!otpSent ? (
                        /* ─── Step 1: Phone number input ─── */
                        <motion.div
                          key="phone-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-300 ml-1">Numéro de téléphone</label>
                            <motion.div
                              className="relative rounded-xl border"
                              variants={phoneInputVariants}
                              animate={focusedField === 'phone' ? 'focused' : 'idle'}
                            >
                              <motion.div
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                animate={{ color: focusedField === 'phone' ? '#3b82f6' : '#6b7280', scale: focusedField === 'phone' ? 1.1 : 1 }}
                              >
                                <Phone size={18} />
                              </motion.div>
                              <input
                                type="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all duration-300 text-sm sm:text-base"
                              />
                            </motion.div>
                            <p className="text-gray-600 text-xs ml-1">Format: +33 6 XX XX XX XX ou 06 XX XX XX XX</p>
                          </div>

                          <motion.button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading || !phoneNumber.trim()}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] hover:bg-right disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 relative overflow-hidden group"
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                              animate={{ x: ['-200%', '200%'] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />
                            {isLoading ? (
                              <>
                                <Loader size={20} className="animate-spin" />
                                <span>Envoi du SMS...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={18} />
                                <span>Envoyer le code</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      ) : (
                        /* ─── Step 2: OTP verification ─── */
                        <motion.form
                          key="otp-step"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onSubmit={handleVerifyOtp}
                          className="space-y-4"
                        >
                          {/* Phone number chip */}
                          <div className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5">
                            <Phone size={14} className="text-blue-400" />
                            <span className="text-blue-300 text-sm font-medium">{formatPhoneForDisplay(phoneNumber)}</span>
                            <button
                              type="button"
                              onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                              className="text-blue-400/60 hover:text-blue-300 ml-1"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* OTP input */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-300 ml-1">Code de vérification</label>
                            <motion.div
                              className="relative rounded-xl border"
                              variants={phoneInputVariants}
                              animate={focusedField === 'otp' ? 'focused' : 'idle'}
                            >
                              <motion.div
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                animate={{ color: focusedField === 'otp' ? '#3b82f6' : '#6b7280', scale: focusedField === 'otp' ? 1.1 : 1 }}
                              >
                                <KeyRound size={18} />
                              </motion.div>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="000000"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onFocus={() => setFocusedField('otp')}
                                onBlur={() => setFocusedField(null)}
                                required
                                maxLength={6}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all duration-300 text-lg sm:text-xl tracking-[0.5em] text-center font-mono"
                              />
                            </motion.div>
                          </div>

                          {/* OTP progress dots */}
                          <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: 6 }, (_, i) => (
                              <motion.div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                  i < otpCode.length ? 'bg-blue-500' : 'bg-white/10'
                                }`}
                                animate={i < otpCode.length ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.2 }}
                              />
                            ))}
                          </div>

                          {/* Verify button */}
                          <motion.button
                            type="submit"
                            disabled={isLoading || otpCode.length < 6}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] hover:bg-right disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 relative overflow-hidden group"
                          >
                            {isLoading ? (
                              <>
                                <Loader size={20} className="animate-spin" />
                                <span>Vérification...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={18} />
                                <span>Vérifier le code</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </motion.button>

                          {/* Resend */}
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              disabled={otpCountdown > 0}
                              className={`text-sm transition-colors ${
                                otpCountdown > 0
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-blue-400 hover:text-blue-300'
                              }`}
                            >
                              {otpCountdown > 0
                                ? `Renvoyer le code dans ${otpCountdown}s`
                                : 'Renvoyer le code'}
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ═══════════ GOOGLE MODE ═══════════ */}
              {authMode === 'google' && (
                <motion.div
                  key="google-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="relative z-10">
                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 overflow-hidden"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <X size={14} className="text-red-400" />
                          </div>
                          <p className="text-red-300 text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Google centered */}
                    <div className="text-center space-y-5">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      </motion.div>

                      <div>
                        <p className="text-white font-semibold text-lg mb-1">Continuer avec Google</p>
                        <p className="text-gray-500 text-sm">Vous allez être redirigé vers Google</p>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isLoadingGoogle}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-white/[0.06] hover:bg-white/[0.1] disabled:bg-white/[0.02] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-white/[0.08] hover:border-white/[0.15] group"
                      >
                        {isLoadingGoogle ? (
                          <>
                            <Loader size={20} className="animate-spin" />
                            <span>Redirection en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Se connecter avec Google</span>
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ═══ Security badge ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-3 text-gray-500 text-xs"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <Shield size={14} />
            </motion.div>
            <span>Connexion sécurisée • Données protégées</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Shared Notification Banner ───
function NotificationBanner({
  showNotification, successMessage, error, onCloseNotification,
}: {
  showNotification: boolean;
  successMessage: string;
  error: string;
  onCloseNotification: () => void;
}) {
  return (
    <>
      <AnimatePresence>
        {showNotification && successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
              <CheckCircle size={20} className="text-emerald-400" />
            </motion.div>
            <span className="text-emerald-300 text-sm flex-1 font-medium">{successMessage}</span>
            <button onClick={onCloseNotification} className="hover:bg-white/5 rounded-full p-1 transition">
              <X size={14} className="text-emerald-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <X size={14} className="text-red-400" />
            </div>
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}