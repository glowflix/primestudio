import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    if (!isUuid(userId)) {
      return NextResponse.json({ peers: [] });
    }

    const [followingRes, followersRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', userId),
      supabase.from('follows').select('follower_id').eq('following_id', userId),
    ]);

    if (followingRes.error) throw followingRes.error;
    if (followersRes.error) throw followersRes.error;

    const following = new Set((followingRes.data || []).map((row) => row.following_id));
    const mutualIds = (followersRes.data || [])
      .map((row) => row.follower_id)
      .filter((id) => following.has(id));

    if (mutualIds.length === 0) {
      return NextResponse.json({ peers: [] });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', mutualIds);
    if (error) throw error;

    return NextResponse.json({ peers: data || [] });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Get peers error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
