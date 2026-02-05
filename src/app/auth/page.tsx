'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Supabase configuration error';
      setError(errorMessage);
    }
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Supabase is not ready');

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMessage('✅ Connecté avec succès!');
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
        setSuccessMessage('✅ Inscription réussie! Vérifiez votre email.');
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'authentification';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoadingGoogle(true);

    try {
      if (!supabase) throw new Error('Supabase is not ready');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion Google';
      setError(errorMessage);
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              Prime Studio
            </h1>
            <p className="text-gray-400 text-lg">
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte Prime Studio'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex gap-3"
            >
              <Mail size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* Email & Password Form */}
          <motion.form
            onSubmit={handleEmailAuth}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
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
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {isLogin ? 'Connexion...' : 'Création du compte...'}
                </>
              ) : (
                <>{isLogin ? 'Se connecter' : 'Créer mon compte'}</>
              )}
            </motion.button>

            {/* Toggle between login and signup */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-sm text-gray-400 hover:text-pink-400 transition"
              >
                {isLogin ? "Pas encore de compte ? " : "Vous avez un compte ? "}
                <span className="font-semibold text-pink-400">
                  {isLogin ? "S&apos;inscrire" : "Se connecter"}
                </span>
              </button>
            </div>
          </motion.form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black text-gray-500">ou</span>
            </div>
          </div>

          {/* Google Login - Pro Design */}
          <motion.button
            onClick={handleGoogleAuth}
            disabled={isLoadingGoogle}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(236, 72, 153, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-white/8 hover:bg-white/15 disabled:bg-white/5 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border border-white/20 hover:border-white/30"
          >
          {isLoadingGoogle ? (
              <>
                <Loader size={18} className="animate-spin" />
                Redirection en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
              </>
            )}
          </motion.button>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <p className="text-blue-300 text-sm leading-relaxed">
              🔒 Vos données sont sécurisées et stockées dans <strong>Supabase Cloud</strong>. Aucune information n&apos;est partagée.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
