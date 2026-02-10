'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Peer = {
  id: string;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

const SUPPORT_USERNAME = process.env.NEXT_PUBLIC_SUPPORT_USERNAME || 'noverliecg';
const SUPPORT_ID = process.env.NEXT_PUBLIC_SUPPORT_USER_ID || '';

export default function ClientMessages() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [activePeer, setActivePeer] = useState<Peer | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) {
          window.location.href = '/auth';
          return;
        }
        setUserId(user.id);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error(err);
      }
    };
    init();
  }, []);

  const loadPeers = useCallback(
    async (uid: string) => {
      const res = await fetch(`/api/peers?userId=${uid}`);
      const data = await res.json();
      const list = (data.peers || []) as Peer[];
      setPeers(list);

      const peerParam = searchParams.get('peer');
      const byParam = list.find((p) => p.id === peerParam);
      if (byParam) {
        setActivePeer(byParam);
        return;
      }

      const bySupportId = SUPPORT_ID ? list.find((p) => p.id === SUPPORT_ID) : null;
      if (bySupportId) {
        setActivePeer(bySupportId);
        return;
      }

      const bySupportUsername = list.find(
        (p) => p.username?.toLowerCase() === SUPPORT_USERNAME.toLowerCase()
      );
      setActivePeer(bySupportUsername || list[0] || null);
    },
    [searchParams]
  );

  const loadMessages = useCallback(async (uid: string, peerId: string) => {
    const res = await fetch(`/api/messages?userId=${uid}&peerId=${peerId}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setBlocked(Boolean(data.blocked));
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadPeers(userId);
  }, [userId, loadPeers]);

  useEffect(() => {
    if (!userId || !activePeer) return;
    loadMessages(userId, activePeer.id);
  }, [userId, activePeer, loadMessages]);

  const handleSend = async () => {
    if (!userId || !newMessage.trim() || !activePeer) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        receiverId: activePeer.id,
        content: newMessage.trim(),
      }),
    });
    setNewMessage('');
    loadMessages(userId, activePeer.id);
  };

  const ordered = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-lg font-semibold">Messagerie</p>
            <p className="text-xs text-gray-400">Uniquement entre amis (mutual follow)</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 h-[60vh] overflow-y-auto">
            {peers.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun ami pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {peers.map((peer) => {
                  const active = activePeer?.id === peer.id;
                  return (
                    <button
                      key={peer.id}
                      onClick={() => setActivePeer(peer)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition border ${
                        active
                          ? 'border-pink-500/60 bg-pink-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {peer.display_name || peer.username || 'Utilisateur'}
                      </div>
                      {peer.username && <div className="text-[11px] text-gray-400">@{peer.username}</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!activePeer ? (
                <p className="text-gray-400 text-sm">Sélectionne un ami pour discuter.</p>
              ) : blocked ? (
                <p className="text-red-300 text-sm">
                  Vous devez vous suivre mutuellement pour discuter.
                </p>
              ) : ordered.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun message pour l’instant.</p>
              ) : (
                ordered.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender_id === userId ? 'ml-auto bg-pink-500/20 text-pink-100' : 'bg-white/10'
                    }`}
                  >
                    {msg.body}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrire un message..."
                disabled={!activePeer || blocked}
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
              />
              <motion.button
                onClick={handleSend}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={!activePeer || blocked}
                className="px-4 py-3 rounded-xl bg-pink-500 text-white flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                Envoyer
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
