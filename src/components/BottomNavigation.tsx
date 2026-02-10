'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ShoppingBag, Play, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/store', label: 'Galerie', icon: ShoppingBag },
  { href: '/videos', label: 'Vidéos', icon: Play },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-black/95 backdrop-blur-sm border-t border-white/5">
      <div className="flex items-center justify-around px-2 pt-2.5 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-4 transition-colors duration-200 ${
                isActive ? 'text-pink-500' : 'text-white/40'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.2 : 1.5} />
              <span className={`text-[11px] leading-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}