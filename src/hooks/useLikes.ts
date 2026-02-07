import { useState, useEffect } from 'react';

export function useLikes(photoId: string, userId: string | null) {
  const [count, setCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, [photoId, userId]);

  const fetchLikes = async () => {
    try {
      const params = new URLSearchParams({ photoId });
      if (userId) params.append('userId', userId);

      const res = await fetch(`/api/likes?${params}`);
      const data = await res.json();

      setCount(data.count);
      setIsLiked(data.userLiked);
    } catch (err) {
      console.error('Failed to fetch likes:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!userId) return;

    try {
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
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return { count, isLiked, loading, toggleLike };
}
