'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

type UserProfile = {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
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

type SavedPhoto = {
  id: string;
  image_url: string;
  title?: string;
  created_at?: string;
};

type TabType = 'gallery' | 'saved';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);

  // Hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', username: '', bio: '', avatar_url: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Password & Email
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [emailError, setEmailError] = useState('');

  // Pagination
  const PAGE_SIZE = 12;
  const [galleryPage, setGalleryPage] = useState(1);
  const visiblePhotos = photos.slice(0, galleryPage * PAGE_SIZE);
  const visibleSaved = savedPhotos.slice(0, galleryPage * PAGE_SIZE);

  // Mock follow stats (replace with real data when backend ready)
  const followersCount = 0;
  const followingCount = 0;

  const loadProfile = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (err) throw err;
      if (data) {
        setProfile(data);
        setEditForm({
          display_name: data.display_name || '',
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, []);

  const loadPhotos = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client
        .from('photos')
        .select('id, user_id, image_url, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
    }
  }, []);

  const loadSavedPhotos = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client
        .from('saved_photos')
        .select('photos(id, image_url, title, created_at)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (err) {
        // Table might not exist yet
        if (err.code === 'PGRST205' || err.code === '42P01') {
          setSavedPhotos([]);
          return;
        }
        throw err;
      }
      const mapped = (data || [])
        .map((row: { photos: SavedPhoto | null }) => row.photos)
        .filter((photo: SavedPhoto | null): photo is SavedPhoto => Boolean(photo));
      setSavedPhotos(mapped);
    } catch (err) {
      console.error('Error loading saved photos:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let client: ReturnType<typeof createSupabaseClient> | null = null;
    try {
      client = createSupabaseClient();
      setSupabase(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Supabase configuration error');
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
        await loadSavedPhotos(client!, data.session.user.id);
        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error loading session');
          setIsLoading(false);
        }
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, [router, loadProfile, loadPhotos, loadSavedPhotos]);

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout error');
    }
  };

  const handleSaveProfile = async () => {
    if (!supabase || !user) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...editForm }, { onConflict: 'id' });
      if (err) throw err;
      setProfile({ ...(profile || { id: user.id }), ...editForm });
      setIsEditMode(false);
      setError('✅ Profil mis à jour avec succès');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!passwordForm.new || !passwordForm.confirm) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }
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
      setError('✅ Mot de passe mis à jour');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = async () => {
    setEmailError('');
    if (!emailForm.email) {
      setEmailError('Veuillez entrer votre nouvel email');
      return;
    }
    if (!supabase) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ email: emailForm.email });
      if (err) throw err;
      setShowEmailForm(false);
      setError('✅ Email envoyé. Vérifiez votre boîte mail.');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-xs">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Mon Profil</h1>
            <p className="text-gray-500 text-sm">Connectez-vous pour accéder à votre profil</p>
          </div>
          <Link href="/auth">
            <button className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition text-sm">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || user.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-8">
      {/* ===== MOBILE HEADER WITH HAMBURGER MENU ===== */}
      <div className="md:hidden sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-11">
          <h1 className="text-sm font-bold text-white truncate max-w-[200px]">
            {profile?.username ? `@${profile.username}` : displayName}
          </h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-white/70 hover:text-white transition"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="py-1 px-2">
                {[
                  { label: 'Messages', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', action: () => { router.push('/messages'); setMenuOpen(false); } },
                  { label: 'Modifier le profil', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z', action: () => { setIsEditMode(true); setMenuOpen(false); } },
                  { label: 'Changer l\'email', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5', action: () => { setShowEmailForm(true); setMenuOpen(false); } },
                  { label: 'Changer le mot de passe', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', action: () => { setShowPasswordForm(true); setMenuOpen(false); } },
                  { label: 'Déconnexion', icon: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9', action: () => { handleLogout(); setMenuOpen(false); }, danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition ${
                      'danger' in item && item.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* ===== ERROR / SUCCESS TOAST ===== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-14 md:top-24 left-4 right-4 z-50 max-w-md mx-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              error.startsWith('✅')
                ? 'bg-emerald-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {error.replace('✅ ', '')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PROFILE HEADER ===== */}
      <div className="max-w-lg mx-auto px-4 pt-6 md:pt-28">
        {/* Avatar + Name + Stats */}
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5">
              {profile?.avatar_url ? (
                <NextImage
                  src={profile.avatar_url}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="text-lg font-bold text-white">{displayName}</h2>
          {profile?.username && (
            <p className="text-gray-500 text-xs mt-0.5">@{profile.username}</p>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p className="text-gray-400 text-xs text-center mt-2 max-w-[260px] leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-base font-bold text-white">{photos.length}</p>
              <p className="text-[10px] text-gray-500">Publications</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white">{followersCount}</p>
              <p className="text-[10px] text-gray-500">Abonnés</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white">{followingCount}</p>
              <p className="text-[10px] text-gray-500">Abonnements</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 w-full max-w-xs">
            <button
              onClick={() => setIsEditMode(true)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition"
            >
              Modifier le profil
            </button>
            <button
              onClick={() => router.push('/messages')}
              className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition"
            >
              Message
            </button>
            {/* Desktop-only: settings + logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex p-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition"
              title="Déconnexion"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsEditMode(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-2xl md:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Modifier le profil</h3>
                <button onClick={() => setIsEditMode(false)} className="text-gray-500 hover:text-white p-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {[
                { label: 'Nom affiché', key: 'display_name', type: 'text', placeholder: 'Votre nom' },
                { label: "Nom d'utilisateur", key: 'username', type: 'text', placeholder: 'votre_pseudo' },
                { label: 'Avatar URL', key: 'avatar_url', type: 'url', placeholder: 'https://...' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={editForm[field.key as keyof typeof editForm]}
                    onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Parlez de vous..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== EMAIL CHANGE MODAL ===== */}
      <AnimatePresence>
        {showEmailForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEmailForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-2xl md:rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Changer l&apos;email</h3>
                <button onClick={() => setShowEmailForm(false)} className="text-gray-500 hover:text-white p-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nouvel email</label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ email: e.target.value })}
                  placeholder="nouvel@email.com"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                />
                {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
              </div>
              <button
                onClick={handleEmailChange}
                disabled={isSaving}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PASSWORD CHANGE MODAL ===== */}
      <AnimatePresence>
        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPasswordForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-2xl md:rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Changer le mot de passe</h3>
                <button onClick={() => { setShowPasswordForm(false); setPasswordError(''); }} className="text-gray-500 hover:text-white p-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Nouveau mot de passe"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Confirmer</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirmer le mot de passe"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                />
                {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TABS ===== */}
      <div className="max-w-lg mx-auto mt-5">
        <div className="flex border-b border-white/10">
          {[
            { id: 'gallery' as TabType, label: 'Publications', icon: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z' },
            { id: 'saved' as TabType, label: 'Enregistrés', icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setGalleryPage(1); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition relative ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              <span className="uppercase tracking-wider">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="max-w-lg mx-auto px-1">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {visiblePhotos.length > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-3 gap-px">
                    {visiblePhotos.map((photo, idx) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative aspect-square bg-white/5 overflow-hidden"
                      >
                        <NextImage
                          src={photo.image_url}
                          alt={photo.title || `Photo ${idx + 1}`}
                          fill
                          className="object-cover hover:opacity-80 transition-opacity duration-200"
                          sizes="33vw"
                          quality={70}
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                  {visiblePhotos.length < photos.length && (
                    <div className="text-center pb-4">
                      <button
                        onClick={() => setGalleryPage(galleryPage + 1)}
                        className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg transition"
                      >
                        Voir plus
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucune publication</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {visibleSaved.length > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-3 gap-px">
                    {visibleSaved.map((photo, idx) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative aspect-square bg-white/5 overflow-hidden"
                      >
                        <NextImage
                          src={photo.image_url}
                          alt={photo.title || `Saved ${idx + 1}`}
                          fill
                          className="object-cover hover:opacity-80 transition-opacity duration-200"
                          sizes="33vw"
                          quality={70}
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                  {visibleSaved.length < savedPhotos.length && (
                    <div className="text-center pb-4">
                      <button
                        onClick={() => setGalleryPage(galleryPage + 1)}
                        className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg transition"
                      >
                        Voir plus
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Aucune photo enregistrée</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}