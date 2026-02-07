import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { photoId, userId, content } = await req.json();

    if (!photoId || !userId || !content) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const { data, error } = await supabase.from('comments').insert({
      photo_id: photoId,
      user_id: userId,
      content,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error('Comment error:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*, user:user_id(email)')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (e: any) {
    console.error('Get comments error:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { commentId, userId } = await req.json();

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // Verify ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Delete comment error:', e);
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 }
    );
  }
}
