import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(req: Request) {
  try {
    const { photoId, userId, action } = await req.json();

    if (!photoId || !userId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(photoId) || !isUuid(userId)) {
      return NextResponse.json({ ok: false, liked: false });
    }

    if (action === 'like') {
      // Check if already liked
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ ok: true, liked: false });
      } else {
        // Like
        const { error } = await supabase.from('likes').insert({
          photo_id: photoId,
          user_id: userId,
        });

        if (error) throw error;

        return NextResponse.json({ ok: true, liked: true });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Like error:', error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photoId');
    const userId = searchParams.get('userId');

    if (!photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
    }
    if (!isUuid(photoId)) {
      return NextResponse.json({ count: 0, userLiked: false });
    }

    // Get like count
    const { count } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('photo_id', photoId);

    // Check if user liked
    let userLiked = false;
    if (userId) {
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      userLiked = !!existing;
    }

    return NextResponse.json({ count: count || 0, userLiked });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Get likes error:', error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
