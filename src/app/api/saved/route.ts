import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(req: Request) {
  try {
    const { photoId, userId, action } = await req.json();

    if (!photoId || !userId || !action) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(photoId) || !isUuid(userId)) {
      return NextResponse.json({ ok: false, saved: false });
    }

    if (action === 'save') {
      const { data: existing } = await supabase
        .from('saved_photos')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('saved_photos')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ ok: true, saved: false });
      }

      const { error } = await supabase.from('saved_photos').insert({
        photo_id: photoId,
        user_id: userId,
      });

      if (error) throw error;

      return NextResponse.json({ ok: true, saved: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Save error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photoId');
    const userId = searchParams.get('userId');

    if (!photoId || !userId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(photoId) || !isUuid(userId)) {
      return NextResponse.json({ saved: false });
    }

    const { data: existing } = await supabase
      .from('saved_photos')
      .select('id')
      .eq('photo_id', photoId)
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ saved: Boolean(existing) });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Get saved error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
