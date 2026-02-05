'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Mail, Phone, User as UserIcon, LogOut, Send, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'messages'>('profile');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);

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

    client.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadMessages();
      }
      setIsLoading(false);
    });

    const { data: sub } = client.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMessages();
      } else {
        setMessages([]);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadMessages = async () => {
    try {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', session.user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setMessages(data ?? []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!messageText.trim() || !user) {
      setError('Message vide');
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Supabase is not ready');
      const { error: err } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            content: messageText,
            sender_email: user.email,
          },
        ]);

      if (err) throw err;

      setMessageText('');
      await loadMessages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Supabase is not ready');
      await supabase.auth.signOut();
      setUser(null);
      setMessages([]);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={40} className="text-pink-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
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
                Se connecter / S'inscrire
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/20 to-black pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">Mon Profil</h1>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              <LogOut size={18} />
              Déconnexion
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-pink-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon size={18} />
                Profil
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                loadMessages();
              }}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'messages'
                  ? 'border-b-2 border-pink-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                Messages ({messages.length})
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="text-white mt-1 flex items-center gap-2">
                      <Mail size={16} className="text-pink-500" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">ID</label>
                    <p className="text-white mt-1 text-sm break-all">{user.id}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400">Provider</label>
                  <p className="text-white mt-1">
                    {user.app_metadata?.provider === 'google' ? '🔵 Google' : '📧 Email'}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Inscrit le {new Date(user.created_at!).toLocaleDateString('fr-FR')}
                </div>
              </motion.div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              {/* Send Message Form */}
              <motion.form
                onSubmit={handleSendMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4"
              >
                <h2 className="text-xl font-bold text-white">Envoyer un Message</h2>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez votre message à Prime Studio..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50 transition resize-none"
                />
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
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Envoyer
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Messages List */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">Vos Messages ({messages.length})</h2>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 text-center text-gray-400"
                  >
                    Aucun message envoyé pour le moment.
                  </motion.div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-400">À: Prime Studio</p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <p className="text-white">{msg.content}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
