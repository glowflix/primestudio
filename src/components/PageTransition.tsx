'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPath = useRef(pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip transition on first mount (splash screen handles that)
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPath.current = pathname;
      return;
    }

    // Only trigger transition when path actually changes
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setTransitioning(true);

      // After the cover animation reaches center, swap content
      const swapTimer = setTimeout(() => {
        setDisplayChildren(children);
      }, 350);

      // After animation completes, hide overlay
      const endTimer = setTimeout(() => {
        setTransitioning(false);
      }, 700);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(endTimer);
      };
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div className="relative">
      {displayChildren}

      <AnimatePresence>
        {transitioning && (
          <motion.div
            key={pathname}
            className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Dark overlay that sweeps */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.95, 0.95, 0] }}
              transition={{ duration: 0.7, times: [0, 0.3, 0.6, 1], ease: 'easeInOut' }}
            />

            {/* Center animation: spinning rings + mini logo */}
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1, 0.8], opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, times: [0, 0.4, 1], ease: 'easeInOut' }}
            >
              {/* Spinning ring 1 */}
              <motion.div
                className="absolute w-16 h-16 rounded-full"
                style={{
                  border: '1.5px solid transparent',
                  borderTopColor: 'rgba(236,72,153,0.5)',
                  borderRightColor: 'rgba(236,72,153,0.2)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: 'linear' }}
              />
              {/* Spinning ring 2 - counter */}
              <motion.div
                className="absolute w-12 h-12 rounded-full"
                style={{
                  border: '1px solid transparent',
                  borderBottomColor: 'rgba(255,255,255,0.15)',
                  borderLeftColor: 'rgba(255,255,255,0.05)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
              {/* Spinning ring 3 - outer dashed */}
              <motion.div
                className="absolute w-20 h-20 rounded-full"
                style={{
                  border: '1px dashed rgba(236,72,153,0.12)',
                }}
                animate={{ rotate: 180 }}
                transition={{ duration: 0.7, ease: 'linear' }}
              />

              {/* Mini camera logo */}
              <svg className="w-7 h-7" viewBox="0 0 200 200" fill="none">
                <defs>
                  <linearGradient id="transGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <rect x="40" y="60" width="120" height="80" rx="8" stroke="url(#transGrad)" strokeWidth="4" fill="none" />
                <circle cx="100" cy="100" r="30" stroke="url(#transGrad)" strokeWidth="4" fill="none" />
                <circle cx="100" cy="100" r="12" fill="url(#transGrad)" />
                <rect x="45" y="50" width="15" height="10" rx="2" fill="url(#transGrad)" />
                <circle cx="165" cy="80" r="6" fill="url(#transGrad)" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
