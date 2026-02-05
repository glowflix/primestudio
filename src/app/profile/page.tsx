'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Mail, User as UserIcon, LogOut, Lock, Camera, Share2, Heart, AlertCircle, Loader, Check, Edit2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  created_at: string;
  provider: string;
};

type UserPhoto = {
  id: string;
  user_id: string;
  image_url: string;
  title?: string;
  description?: string;
  likes_count?: number;
  shares_count?: number;
  created_at: string;
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'settings'>('overview');
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);

  // Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');

  // Share
  const [copiedLink, setCopiedLink] = useState('');

  // Initialize
  useEffect(() => {
    let mounted = true;
    let client: ReturnType<typeof createSupabaseClient> | null = null;

    try {
      client = createSupabaseClient();
      setSupabase(client);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Supabase configuration error';
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data } = await client!.auth.getSession();
        if (!mounted) return;

        if (!data.session?.user) {
          router.push('/auth');
          return;
        }

        setUser(data.session.user);
        await loadProfile(client!, data.session.user.id);
        await loadPhotos(client!, data.session.user.id);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading session';
        if (mounted) {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    const { data: sub } = client.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        router.push('/auth');
      } else {
        setUser(session.user);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const loadProfile = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client.from('user_profiles').select('*').eq('id', userId).single();

      if (err && err.code !== 'PGRST116') throw err;

      if (data) {
        setProfile(data);
        setEditForm({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, []);

  const loadPhotos = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client
        .from('user_photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Supabase is not ready');
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !supabase) return;
    setIsSaving(true);
    setError('');

    try {
      const { error: err } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: editForm.full_name,
          bio: editForm.bio,
          phone: editForm.phone,
          provider: user.app_metadata?.provider || 'email',
          created_at: user.created_at,
        });

      if (err) throw err;
      await loadProfile(supabase, user.id);
      setIsEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!supabase) return;
    setIsSaving(true);

    try {
      const { error: err } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (err) throw err;

      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
      setError('✅ Mot de passe changé avec succès');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setIsSaving(false);
    }
  };

  const sharePhotoLink = (photo: UserPhoto) => {
    const url = `${window.location.origin}/store?photo=${photo.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(photo.id);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Loader size={40} className="text-pink-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
        <div className="max-w-md mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Profil</h1>
              <p className="text-gray-400">Vous devez être connecté</p>
            </div>
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-300"
              >
                Se connecter
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const provider = user.app_metadata?.provider || 'email';
  const providerIcon = provider === 'google' ? '🔵' : '📧';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header avec Info Utilisateur */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              >
                {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.full_name || user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-400">{providerIcon} Connecté via {provider === 'google' ? 'Google' : 'Email'}</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition border border-red-500/30"
            >
              <LogOut size={18} />
              Déconnexion
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`border rounded-lg p-4 flex gap-3 ${
                error.startsWith('✅')
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <AlertCircle
                size={20}
                className={error.startsWith('✅') ? 'text-green-500' : 'text-red-500'}
              />
              <p className={error.startsWith('✅') ? 'text-green-300' : 'text-red-300'}>{error}</p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
            {(['overview', 'gallery', 'settings'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'overview' && <div className="flex items-center gap-2"><UserIcon size={18} />Aperçu</div>}
                {tab === 'gallery' && <div className="flex items-center gap-2"><Camera size={18} />Galerie ({photos.length})</div>}
                {tab === 'settings' && <div className="flex items-center gap-2"><Lock size={18} />Paramètres</div>}
              </motion.button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Profile Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Informations du Profil</h2>
                  {!isEditMode && (
                    <motion.button
                      onClick={() => setIsEditMode(true)}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </motion.button>
                  )}
                </div>

                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nom Complet</label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Parlez-nous de vous..."
                        rows={3}
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+243 895 438 484"
                        className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        whileHover={{ scale: 1.05 }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-lg transition"
                      >
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </motion.button>
                      <motion.button
                        onClick={() => setIsEditMode(false)}
                        whileHover={{ scale: 1.05 }}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition"
                      >
                        Annuler
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Mail size={16} className="text-pink-500" />
                        {user.email}
                      </p>
                    </div>
                    {profile?.full_name && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Nom</p>
                        <p className="text-white font-medium">{profile.full_name}</p>
                      </div>
                    )}
                    {profile?.phone && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Téléphone</p>
                        <p className="text-white font-medium">{profile.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Membre depuis</p>
                      <p className="text-white font-medium">
                        {new Date(user.created_at || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
                {profile?.bio && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Bio</p>
                    <p className="text-white">{profile.bio}</p>
                  </div>
                )}
              </motion.div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Photos', value: photos.length, icon: Camera },
                  { label: 'Partages', value: photos.reduce((acc, p) => acc + (p.shares_count || 0), 0), icon: Share2 },
                  { label: 'Likes', value: photos.reduce((acc, p) => acc + (p.likes_count || 0), 0), icon: Heart },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-lg p-6 text-center"
                    >
                      <Icon size={24} className="text-pink-400 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {photos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-12 text-center"
                >
                  <Camera size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucune photo pour le moment</p>
                  <Link href="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg"
                    >
                      Réserver une séance
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {photos.map((photo, idx) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                    >
                      <div className="relative h-48 bg-black">
                        <NextImage
                          src={photo.image_url}
                          alt={photo.title || 'Photo'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        {photo.title && <p className="font-semibold text-white mb-1">{photo.title}</p>}
                        {photo.description && <p className="text-sm text-gray-400 mb-3">{photo.description}</p>}
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => sharePhotoLink(photo)}
                            whileHover={{ scale: 1.1 }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition"
                          >
                            {copiedLink === photo.id ? (
                              <>
                                <Check size={16} />
                                Copié
                              </>
                            ) : (
                              <>
                                <Share2 size={16} />
                                Partager
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-pink-500" />
                  Sécurité du Compte
                </h3>

                {provider === 'email' && (
                  <div className="space-y-4">
                    {!showPasswordForm ? (
                      <motion.button
                        onClick={() => setShowPasswordForm(true)}
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition"
                      >
                        Changer le mot de passe
                      </motion.button>
                    ) : (
                      <motion.form
                        onSubmit={handleChangePassword}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Nouveau Mot de Passe</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le Mot de Passe</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        {passwordError && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-300 text-sm">{passwordError}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <motion.button
                            type="submit"
                            disabled={isSaving}
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg transition"
                          >
                            {isSaving ? 'Changement...' : 'Confirmer'}
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ current: '', new: '', confirm: '' });
                              setPasswordError('');
                            }}
                            className="flex-1 px-4 py-2 bg-white/10 text-white font-bold rounded-lg transition"
                          >
                            Annuler
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </div>
                )}

                {provider === 'google' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      ✅ Vous êtes connecté via Google. La sécurité de votre compte est gérée par Google.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6">Informations du Compte</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID Utilisateur:</span>
                    <span className="text-white font-mono text-xs break-all max-w-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fournisseur d&apos;Authentification:</span>
                    <span className="text-white">{provider === 'google' ? '🔵 Google' : '📧 Email'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compte créé:</span>
                    <span className="text-white">{new Date(user.created_at || '').toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
