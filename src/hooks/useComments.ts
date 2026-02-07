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
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/comments?photoId=${photoId}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Erreur de chargement des commentaires');
        return;
      }

      setComments(data.comments || []);
      setCount(data.comments?.length || 0);
    } catch (err) {
      setError('Erreur de chargement des commentaires');
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
      setError(null);
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
      setError(data.error || 'Erreur lors de l’envoi du commentaire');
      return false;
    } catch (err) {
      setError('Erreur lors de l’envoi du commentaire');
      console.error('Failed to add comment:', err);
      return false;
    }
  };

  const deleteComment = async (commentId: string, userId: string) => {
    try {
      setError(null);
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
      setError(data.error || 'Erreur de suppression du commentaire');
      return false;
    } catch (err) {
      setError('Erreur de suppression du commentaire');
      console.error('Failed to delete comment:', err);
      return false;
    }
  };

  return { comments, count, loading, error, addComment, deleteComment };
}
