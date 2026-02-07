import { useEffect, useState } from 'react';

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function useSaved(photoId: string, userId: string | null) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!photoId || !userId || !isUuid(photoId)) {
      setIsSaved(false);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ photoId, userId });
      const res = await fetch(`/api/saved?${params.toString()}`);
      const data = await res.json();
      setIsSaved(Boolean(data.saved));
    } catch {
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId, userId]);

  const toggleSave = async () => {
    if (!photoId || !userId || !isUuid(photoId)) return { saved: false };
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, userId, action: 'save' }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsSaved(Boolean(data.saved));
      }
      return { saved: Boolean(data.saved) };
    } catch {
      return { saved: false };
    }
  };

  return { isSaved, loading, toggleSave };
}
