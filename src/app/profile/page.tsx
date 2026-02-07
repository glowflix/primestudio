'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

// Professional SVG Icons
const SvgIcon = {
  User: <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>,
  LogOut: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
  Edit: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" /></svg>,
  Check: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
  X: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  Phone: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  Gallery: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  Settings: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-15.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24" /></svg>,
  Lock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  AlertCircle: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Loader: <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>,
};

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

type SavedPhoto = {
  id: string;
  image_url: string;
  title?: string;
  created_at?: string;
};

type TabType = 'overview' | 'gallery' | 'saved' | 'settings';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);

  // Pagination
  const GALLERY_PAGE_SIZE = 12;
  const [galleryPage, setGalleryPage] = useState(1);
  const visiblePhotos = photos.slice(0, galleryPage * GALLERY_PAGE_SIZE);
  const visibleSaved = savedPhotos.slice(0, galleryPage * GALLERY_PAGE_SIZE);

  // Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');


  // --- Déclaration des callbacks avant le useEffect ---
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

  const loadSavedPhotos = useCallback(async (client: ReturnType<typeof createSupabaseClient>, userId: string) => {
    try {
      const { data, error: err } = await client
        .from('saved_photos')
        .select('photos(id, image_url, title, created_at)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (err) throw err;

      const mapped = (data || [])
        .map((row: { photos: SavedPhoto | null }) => row.photos)
        .filter((photo: SavedPhoto | null): photo is SavedPhoto => Boolean(photo));
      setSavedPhotos(mapped);
    } catch (err) {
      console.error('Error loading saved photos:', err);
    }
  }, []);

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
        await loadSavedPhotos(client!, data.session.user.id);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading session';
        if (mounted) {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    initAuth();
    return () => { mounted = false; };
  }, [router, loadProfile, loadPhotos, loadSavedPhotos]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab') as TabType | null;
    if (tab && ['overview', 'gallery', 'saved', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

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
        .from('user_profiles')
        .upsert({ id: user.id, ...editForm }, { onConflict: 'id' });
      if (err) throw err;
      setProfile({ ...profile!, ...editForm, id: user.id, email: user.email || '', created_at: user.created_at || '', provider: user.app_metadata?.provider || 'email' });
      setIsEditMode(false);
      setError('✅ Profile updated successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!passwordForm.new || !passwordForm.confirm) {
      setPasswordError('Please fill all fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (!supabase) return;
    setIsSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (err) throw err;
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
      setError('✅ Password updated successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black flex items-center justify-center pt-20">
        <div className="text-pink-500">{SvgIcon.Loader}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="w-20 h-20 mx-auto text-pink-500">{SvgIcon.User}</div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-400 text-lg">Sign in to continue</p>
            </div>
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold rounded-xl transition duration-300 shadow-lg hover:shadow-pink-500/30"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-white/5 to-white/5 border border-white/10 rounded-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Avatar + Info */}
              <div className="flex items-center gap-6 flex-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
                >
                  <div className="w-12 h-12 lg:w-16 lg:h-16">{SvgIcon.User}</div>
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </h1>
                  <div className="flex flex-col gap-2 text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4">{SvgIcon.Mail}</div>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <p className="text-sm">Member since {new Date(user.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl transition border border-red-600/50 font-semibold self-start lg:self-auto"
              >
                <div className="w-5 h-5">{SvgIcon.LogOut}</div>
                Sign Out
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border rounded-xl p-4 flex gap-3 ${
                  error.startsWith('✅')
                    ? 'bg-green-600/20 border-green-600/50 text-green-300'
                    : 'bg-red-600/20 border-red-600/50 text-red-300'
                }`}
              >
                <div className="w-5 h-5 flex-shrink-0 mt-0.5">{error.startsWith('✅') ? SvgIcon.Check : SvgIcon.AlertCircle}</div>
                <p className="text-sm font-medium">{error.replace('✅ ', '')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
            {(['overview', 'gallery', 'saved', 'settings'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'overview' && (
                  <>
                    <div className="w-5 h-5">{SvgIcon.User}</div>
                    <span className="hidden sm:inline">Overview</span>
                  </>
                )}
                {tab === 'gallery' && (
                  <>
                    <div className="w-5 h-5">{SvgIcon.Gallery}</div>
                    <span className="hidden sm:inline">Gallery</span>
                    <span className="text-xs bg-pink-600/30 px-2 py-1 rounded-full">{photos.length}</span>
                  </>
                )}
                {tab === 'saved' && (
                  <>
                    <div className="w-5 h-5">{SvgIcon.Gallery}</div>
                    <span className="hidden sm:inline">Saved</span>
                    <span className="text-xs bg-pink-600/30 px-2 py-1 rounded-full">{savedPhotos.length}</span>
                  </>
                )}
                {tab === 'settings' && (
                  <>
                    <div className="w-5 h-5">{SvgIcon.Settings}</div>
                    <span className="hidden sm:inline">Settings</span>
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                    {!isEditMode && (
                      <motion.button
                        onClick={() => setIsEditMode(true)}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-xl transition font-semibold"
                      >
                        <div className="w-4 h-4">{SvgIcon.Edit}</div>
                        Edit
                      </motion.button>
                    )}
                  </div>

                  {isEditMode ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Bio</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+243 895 438 484"
                          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          whileHover={{ scale: 1.02 }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                        <motion.button
                          onClick={() => setIsEditMode(false)}
                          whileHover={{ scale: 1.02 }}
                          className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Email</p>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 text-pink-500">{SvgIcon.Mail}</div>
                          <p className="text-white font-medium text-sm">{user.email}</p>
                        </div>
                      </div>
                      {profile?.full_name && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Full Name</p>
                          <p className="text-white font-medium text-sm">{profile.full_name}</p>
                        </div>
                      )}
                      {profile?.phone && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Phone</p>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 text-pink-500">{SvgIcon.Phone}</div>
                            <p className="text-white font-medium text-sm">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Member Since</p>
                        <p className="text-white font-medium text-sm">{new Date(user.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                  {profile?.bio && !isEditMode && (
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Bio</p>
                      <p className="text-gray-300 leading-relaxed text-sm">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {visiblePhotos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visiblePhotos.map((photo, idx) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition"
                        >
                          <NextImage
                            src={photo.image_url}
                            alt={photo.title || `Photo ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            quality={70}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition" />
                        </motion.div>
                      ))}
                    </div>
                    {visiblePhotos.length < photos.length && (
                      <div className="text-center pt-6">
                        <motion.button
                          onClick={() => setGalleryPage(galleryPage + 1)}
                          whileHover={{ scale: 1.02 }}
                          className="px-6 py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-xl font-semibold border border-pink-600/50 transition"
                        >
                          Load More ({visiblePhotos.length}/{photos.length})
                        </motion.button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto text-gray-500 mb-4">{SvgIcon.Gallery}</div>
                    <p className="text-gray-400 text-lg">No photos yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {visibleSaved.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visibleSaved.map((photo, idx) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition"
                        >
                          <NextImage
                            src={photo.image_url}
                            alt={photo.title || `Saved ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            quality={70}
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 bg-pink-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Saved
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition" />
                        </motion.div>
                      ))}
                    </div>
                    {visibleSaved.length < savedPhotos.length && (
                      <div className="text-center pt-6">
                        <motion.button
                          onClick={() => setGalleryPage(galleryPage + 1)}
                          whileHover={{ scale: 1.02 }}
                          className="px-6 py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-xl font-semibold border border-pink-600/50 transition"
                        >
                          Load More ({visibleSaved.length}/{savedPhotos.length})
                        </motion.button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto text-gray-500 mb-4">{SvgIcon.Gallery}</div>
                    <p className="text-gray-400 text-lg">No saved photos yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-6 h-6">{SvgIcon.Lock}</div>
                      Password
                    </h2>
                  </div>

                  {!showPasswordForm ? (
                    <motion.button
                      onClick={() => setShowPasswordForm(true)}
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-xl font-semibold border border-pink-600/50 transition"
                    >
                      Change Password
                    </motion.button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                        />
                      </div>
                      {passwordError && (
                        <div className="text-red-400 text-sm font-medium">{passwordError}</div>
                      )}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
                        >
                          {isSaving ? 'Updating...' : 'Update Password'}
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({ current: '', new: '', confirm: '' });
                            setPasswordError('');
                          }}
                          className="flex-1 px-4 py-3 bg-white/10 text-white font-semibold rounded-xl transition"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
