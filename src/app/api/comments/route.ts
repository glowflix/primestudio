import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const hasServiceRole = Boolean(serviceRoleKey);

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(req: Request) {
  try {
    const { photoId, userId, content } = await req.json();

    if (!photoId || !userId || !content) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    if (!isUuid(photoId) || !isUuid(userId)) {
      return NextResponse.json({ ok: false, comments: [] });
    }

    const { data, error } = await supabase.from('comments').insert({
      photo_id: photoId,
      user_id: userId,
      content,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Server error';
    console.error('Comment error:', error);
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

    if (!photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
    }
    if (!isUuid(photoId)) {
      return NextResponse.json({ comments: [] });
    }

    // 1. Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    const rawComments = commentsData || [];
    if (rawComments.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    // 2. Get unique user_ids from comments
    const userIds = [...new Set(rawComments.map((c: { user_id: string }) => c.user_id))];

    // 3. Fetch profiles for those users
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', userIds);

    // 4. Build a map of user profiles
    const profileMap = new Map<string, { display_name?: string; username?: string; avatar_url?: string }>();
    (profilesData || []).forEach((p: { id: string; display_name?: string; username?: string; avatar_url?: string }) => {
      profileMap.set(p.id, p);
    });

    // 5. Also try to get display names from auth.users metadata via admin API
    // (for Google users who might not have a profiles row yet)
    if (hasServiceRole) {
      const missingUserIds = userIds.filter(uid => {
        const p = profileMap.get(uid);
        return !p || (!p.display_name && !p.username);
      });

      for (const uid of missingUserIds) {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(uid);
          if (authUser?.user) {
            const meta = authUser.user.user_metadata;
            const existing = profileMap.get(uid) || {};
            profileMap.set(uid, {
              ...existing,
              display_name: existing.display_name || meta?.full_name || meta?.name || authUser.user.email?.split('@')[0] || null,
              avatar_url: existing.avatar_url || meta?.avatar_url || meta?.picture || null,
            });
          }
        } catch {
          // User not found, skip
        }
      }
    }

    // 6. Enrich comments with profile data
    const comments = rawComments.map((comment: { user_id: string }) => {
      const profile = profileMap.get(comment.user_id);
      return {
        ...comment,
        user_display: profile?.display_name || profile?.username || null,
        user_avatar: profile?.avatar_url || null,
      };
    });

    return NextResponse.json({ comments });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Server error';
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error },
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
    if (!isUuid(commentId) || !isUuid(userId)) {
      return NextResponse.json({ ok: false });
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
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Server error';
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
