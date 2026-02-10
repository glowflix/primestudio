'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  avatar_url?: string;
  display_name?: string;
  username?: string;
  bio?: string;
}

interface Photo {
  id: string;
  image_url: string;
  title: string;
  category: string;
  model_name: string;
}

export default function ModelProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseClient();

    const loadProfile = async () => {
      try {
        // Load profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, avatar_url, display_name, username, bio')
          .eq('id', userId)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Load photos by user_id
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('id, image_url, title, category, model_name')
          .eq('user_id', userId)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (photosData) {
          setPhotos(photosData);
        }

        if (profileError) console.error('Profile error:', profileError);
        if (photosError) console.error('Photos error:', photosError);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const loadFollowState = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const viewerId = data.session?.user?.id || null;
        setCurrentUserId(viewerId);
        if (!viewerId || viewerId === userId) return;

        const [followRes, followerRes] = await Promise.all([
          supabase.from('follows').select('follower_id').eq('follower_id', viewerId).eq('following_id', userId).single(),
          supabase.from('follows').select('follower_id').eq('follower_id', userId).eq('following_id', viewerId).single(),
        ]);
        setIsFollowing(Boolean(followRes.data));
        setIsFollowedBy(Boolean(followerRes.data));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error(err);
      }
    };
    loadFollowState();
  }, [userId]);

  const toggleFollow = async () => {
    if (!currentUserId || currentUserId === userId) return;
    const supabase = createSupabaseClient();
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId);
      setIsFollowing(false);
      return;
    }
    await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId });
    setIsFollowing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black/95 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Profil non trouvé</p>
        <Link href="/store" className="text-pink-500 hover:text-pink-600">
          Retour à la galerie
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 border-b border-white/10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-300 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {profile.display_name || profile.username || 'Profil'}
          </h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar & Info */}
          <div className="flex flex-col items-center">
            {profile.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || profile.username || 'Profil'}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-pink-500"
              />
            )}
            <h2 className="text-2xl font-bold text-white">
              {profile.display_name || profile.username || 'Profil'}
            </h2>
            {profile.username && <p className="text-gray-400 text-sm mt-1">@{profile.username}</p>}
            {profile.bio && <p className="text-gray-400 text-sm mt-3 max-w-xs text-center">{profile.bio}</p>}
            <p className="text-gray-500 text-sm mt-4">{photos.length} photos</p>
            {currentUserId && currentUserId !== userId && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    isFollowing
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
                {isFollowing && isFollowedBy && (
                  <span className="text-xs text-green-400">Ami confirmé</span>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-pink-500">{photos.length}</p>
                <p className="text-gray-400 text-sm mt-2">Photos</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-pink-500">
                  {[...new Set(photos.map(p => p.category))].length}
                </p>
                <p className="text-gray-400 text-sm mt-2">Catégories</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-pink-500">
                  {photos.reduce((sum) => sum + Math.random() * 50, 0).toFixed(0)}
                </div>
                <div className="text-gray-400 text-sm mt-2">J&apos;aimes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Galerie</h3>
          {photos.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {photos.map((photo: Photo) => (
        <motion.button
                  key={photo.id}
                  onClick={() => {}}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium text-center px-2 line-clamp-2">
                      {photo.title}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Aucune photo pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
