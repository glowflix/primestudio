'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, User } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/store', icon: ShoppingBag, label: 'Galerie' },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 md:hidden bg-black/95 backdrop-blur border-t border-white/10 z-40"
      >
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center gap-1 py-2 px-4"
                >
                  <motion.div
                    animate={{
                      color: isActive ? '#ec4899' : '#9ca3af',
                      scale: isActive ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={24} />
                  </motion.div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-pink-500' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1 h-1 bg-pink-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Spacer for mobile */}
      <div className="md:hidden h-20" />
    </>
  );
}
