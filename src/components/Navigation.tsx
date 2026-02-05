'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/store', label: 'Galerie' },
    { href: '/profile', label: 'Profil' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="hidden md:block fixed w-full top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center">
            <motion.div
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              PRIME
            </motion.div>
            <span className="text-xs text-pink-400 tracking-widest">STUDIO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.button
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.button>
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <Link href="/auth">
            <motion.button
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={18} />
              Connexion
            </motion.button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            className="md:hidden pb-4 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  className={`px-4 py-3 rounded-lg font-medium ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ x: 5 }}
                >
                  {item.label}
                </motion.div>
              </Link>
            ))}
            
            <Link href="/auth" onClick={() => setIsOpen(false)}>
              <motion.div
                className="px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center gap-2"
                whileHover={{ x: 5 }}
              >
                <LogIn size={18} />
                Connexion
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
