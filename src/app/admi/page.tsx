'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import OptimizedImage from '@/components/OptimizedImage';
import { createSupabaseClient } from '@/lib/supabase/client';

type FormData = {
  title: string;
  category: 'portrait' | 'event' | 'urban';
  model_name: string;
  isPublic: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: 'portrait',
    model_name: '',
    isPublic: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          router.push('/auth');
          return;
        }

        const adminEmailsList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim());
        
        const isAdminUser = !!(user.email && adminEmailsList.includes(user.email));
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          setMessage({ type: 'error', text: 'Accès refusé. Admin uniquement.' });
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      setMessage({ type: 'error', text: 'Connectez-vous ou sélectionnez une image' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', formData.title);
      fd.append('category', formData.category);
      fd.append('model_name', formData.model_name);
      fd.append('active', formData.isPublic ? 'true' : 'false');
      fd.append('user_id', user.id);

      console.log('📤 Upload started...', { title: formData.title, category: formData.category });

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: fd,
      });

      const result = await res.json();

      console.log('📨 Response:', { status: res.status, result });

      if (!res.ok) {
        setMessage({ type: 'error', text: result.error || 'Erreur lors du upload' });
        console.error('❌ Upload error:', result.error);
        return;
      }

      setMessage({
        type: 'success',
        text: `Photo publiée avec succès! ID: ${result.id}`,
      });
      console.log('✅ Upload success!', result.id);

      // Reset form
      setFile(null);
      setPreview('');
      setFormData({ title: '', category: 'portrait', model_name: '', isPublic: true });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur serveur';
      console.error('❌ Upload exception:', error);
      setMessage({ type: 'error', text: error });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black flex items-center justify-center pt-32">
        <div className="max-w-md w-full mx-auto px-4">
          <motion.div
            className="bg-black/50 border border-red-500/50 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-white mb-2">Accès Refusé</h1>
            <p className="text-gray-400">Vous n&apos;avez pas les permissions admin.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-black via-pink-950/20 to-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Admin Publish</h1>
            <p className="text-gray-400">Publiez vos photos professionnelles</p>
          </div>

          {/* Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/50 text-green-400'
                  : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {message.text}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Image</label>
              <div className="relative border-2 border-dashed border-pink-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {preview ? (
                  <div className="space-y-2">
                    <div className="relative w-full max-h-64 mx-auto overflow-hidden rounded-lg">
                      <OptimizedImage
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-pink-400">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-pink-500" size={32} />
                    <div>
                      <p className="text-white font-medium">Cliquez ou glissez une image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG, WebP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Titre (optionnel)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Portrait Studio"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'portrait' | 'event' | 'urban' })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              >
                <option value="portrait">Portrait</option>
                <option value="event">Événement</option>
                <option value="urban">Urban</option>
              </select>
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Modèle/Client</label>
              <input
                type="text"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                placeholder="Nom du modèle ou client"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-2">
              <label className="block text-white font-medium">Visibilité</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublic: true })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    formData.isPublic
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublic: false })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    !formData.isPublic
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  Privé
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {formData.isPublic
                  ? 'La photo sera visible dans la galerie publique'
                  : 'La photo ne sera pas visible au public'}
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!file || uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
            >
              {uploading ? 'Téléchargement...' : 'Publier la photo'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Spacer for footer */}
      <div className="h-20" />
    </section>
  );
}
