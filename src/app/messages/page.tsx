import { Suspense } from 'react';
import ClientMessages from './ClientMessages';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>}>
      <ClientMessages />
    </Suspense>
  );
}
