import { useState, useEffect } from 'react';

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: { email: string };
};

export function useComments(photoId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?photoId=${photoId}`);
      const data = await res.json();

      setComments(data.comments || []);
      setCount(data.comments?.length || 0);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId]);

  const addComment = async (userId: string, content: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, userId, content }),
      });

      const data = await res.json();

      if (data.ok) {
        await fetchComments();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return false;
    }
  };

  const deleteComment = async (commentId: string, userId: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId }),
      });

      const data = await res.json();

      if (data.ok) {
        await fetchComments();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete comment:', err);
      return false;
    }
  };

  return { comments, count, loading, addComment, deleteComment };
}
