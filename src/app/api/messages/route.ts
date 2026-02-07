import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const dmKey = (a: string, b: string) => [a, b].sort().join(':');

const ensureMutualFollow = async (userA: string, userB: string) => {
  const [ab, ba] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('follower_id', userA).eq('following_id', userB).single(),
    supabase.from('follows').select('follower_id').eq('follower_id', userB).eq('following_id', userA).single(),
  ]);
  return Boolean(ab.data && ba.data);
};

const getOrCreateConversation = async (userA: string, userB: string) => {
  const key = dmKey(userA, userB);
  const existing = await supabase.from('conversations').select('*').eq('dm_key', key).single();
  if (existing.data) return existing.data;

  const created = await supabase
    .from('conversations')
    .insert({ kind: 'dm', dm_key: key })
    .select('*')
    .single();
  if (created.error) throw created.error;

  await supabase.from('conversation_participants').insert([
    { conversation_id: created.data.id, user_id: userA, role: 'member' },
    { conversation_id: created.data.id, user_id: userB, role: 'member' },
  ]);

  return created.data;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const peerId = searchParams.get('peerId') || searchParams.get('supportId');

    if (!userId || !peerId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(userId) || !isUuid(peerId)) {
      return NextResponse.json({ messages: [] });
    }

    const allowed = await ensureMutualFollow(userId, peerId);
    if (!allowed) {
      return NextResponse.json({ messages: [], blocked: true });
    }

    const convo = await getOrCreateConversation(userId, peerId);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ messages: data || [] });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Get messages error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { senderId, receiverId, content } = await req.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(senderId) || !isUuid(receiverId)) {
      return NextResponse.json({ ok: false });
    }

    const allowed = await ensureMutualFollow(senderId, receiverId);
    if (!allowed) {
      return NextResponse.json({ ok: false, blocked: true });
    }

    const convo = await getOrCreateConversation(senderId, receiverId);
    const { error } = await supabase.from('messages').insert({
      conversation_id: convo.id,
      sender_id: senderId,
      body: content,
    });

    if (error) throw error;

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', convo.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Send message error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
