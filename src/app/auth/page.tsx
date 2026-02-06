'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader, Eye, EyeOff, Sparkles, Shield, Camera, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    try {
      const client = createSupabaseClient();
      setSupabase(client);

      // Check if user is already logged in
      client.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
        if (data.session) {
          router.push('/profile');
        }
      });
    } catch {
      setError('Configuration en cours...');
    }
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Service en cours de chargement');

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMessage('Connexion réussie!');
        setShowNotification(true);
        setTimeout(() => router.push('/profile'), 1500);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccessMessage('Compte créé! Vérifiez votre email.');
        setShowNotification(true);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      // Translate common Supabase errors to French
      const translatedError = translateError(errorMessage);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  const translateError = (error: string): string => {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Email non confirmé. Vérifiez votre boîte mail.',
      'User already registered': 'Cet email est déjà utilisé',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Invalid email': 'Format d\'email invalide',
    };
    return translations[error] || error;
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoadingGoogle(true);

    try {
      if (!supabase) throw new Error('Service en cours de chargement');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion Google';
      setError(errorMessage);
      setIsLoadingGoogle(false);
    }
  };

  // Animated background shapes
  const FloatingShape = ({ delay, duration, size, left, top }: { delay: number; duration: number; size: number; left: string; top: string }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-pink-500/10 to-red-500/10 blur-xl"
      style={{ width: size, height: size, left, top }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-950/20 via-black to-red-950/20" />
      
      {/* Floating shapes */}
      <FloatingShape delay={0} duration={8} size={300} left="10%" top="20%" />
      <FloatingShape delay={2} duration={10} size={200} left="70%" top="60%" />
      <FloatingShape delay={4} duration={12} size={250} left="50%" top="10%" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMC0yIDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo & Header */}
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Camera size={40} className="text-white" />
              </motion.div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                  Prime Studio
                </h1>
                <p className="text-gray-400 mt-2">
                  {isLogin ? 'Bienvenue! Connectez-vous pour continuer' : 'Créez votre compte Prime Studio'}
                </p>
              </div>
            </motion.div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              {/* Success Notification */}
              <AnimatePresence>
                {showNotification && successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="text-green-300 text-sm flex-1">{successMessage}</span>
                    <button onClick={() => setShowNotification(false)}>
                      <X size={16} className="text-green-400" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <X size={16} className="text-red-400" />
                    </div>
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Mot de passe</label>
                  <div className="relative">
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      {isLogin ? 'Connexion...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      {isLogin ? 'Se connecter' : 'Créer mon compte'}
                    </>
                  )}
                </motion.button>

                {/* Toggle Login/Signup */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setSuccessMessage('');
                      setShowNotification(false);
                    }}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    {isLogin ? "Pas encore de compte? " : "Déjà un compte? "}
                    <span className="font-semibold text-pink-400 hover:text-pink-300">
                      {isLogin ? "S'inscrire" : "Se connecter"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-transparent text-gray-500 text-sm">ou continuer avec</span>
                </div>
              </div>

              {/* Google Login */}
              <motion.button
                onClick={handleGoogleAuth}
                disabled={isLoadingGoogle}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-white/10 hover:border-white/20"
              >
                {isLoadingGoogle ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuer avec Google
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 text-gray-500 text-xs"
            >
              <Shield size={14} />
              <span>Connexion sécurisée • Données protégées</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
