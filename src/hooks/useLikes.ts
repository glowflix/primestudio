import { useState, useEffect } from 'react';

export function useLikes(photoId: string, userId: string | null) {
  const [count, setCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ photoId });
      if (userId) params.append('userId', userId);

      const res = await fetch(`/api/likes?${params}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Erreur de chargement des likes');
        return;
      }

      setCount(data.count);
      setIsLiked(data.userLiked);
    } catch (err) {
      setError('Erreur de chargement des likes');
      console.error('Failed to fetch likes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId, userId]);

  const toggleLike = async () => {
    if (!userId) return;

    try {
      setError(null);
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          userId,
          action: 'like',
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setIsLiked(data.liked);
        setCount((prev) => (data.liked ? prev + 1 : prev - 1));
      } else {
        setError(data.error || 'Erreur lors du like');
      }
    } catch (err) {
      setError('Erreur lors du like');
      console.error('Failed to toggle like:', err);
    }
  };

  return { count, isLiked, loading, error, toggleLike };
}
