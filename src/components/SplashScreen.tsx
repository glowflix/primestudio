'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);

  // Deterministic particle positions to avoid hydration mismatch
  const particles = useMemo(() => {
    const seed = [17,83,42,61,9,55,28,74,36,91,13,67,48,5,79,22,88,34,70,3,59,45,81,15,63,38,72,26,94,50];
    return seed.map((s, i) => ({
      left: 5 + (s * 91 + i * 37) % 90,
      top: 5 + ((s * 53 + i * 71) % 90),
      size: 1 + (s % 3),
      size2: 1 + ((s + i) % 3),
      yOffset: (s * 7 + i * 13) % 40,
      delay: ((s * 3 + i * 11) % 200) / 100,
      dur: ((s * 5 + i * 7) % 200) / 100,
    }));
  }, []);

  useEffect(() => {
    // Phase 1: rings + logo appear (0.4s)
    const t1 = setTimeout(() => setPhase(1), 400);
    // Phase 2: iris + lens center (1.4s)
    const t2 = setTimeout(() => setPhase(2), 1400);
    // Phase 3: brand name + flash (2.5s)
    const t3 = setTimeout(() => setPhase(3), 2500);
    // Phase 4: start fade out (4.2s) — logo visible ~2s
    const t4 = setTimeout(() => setPhase(4), 4200);
    // Hide splash (4.8s)
    const t5 = setTimeout(() => {
      setShow(false);
      setContentVisible(true);
    }, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  // Make page content invisible during splash via a global style
  useEffect(() => {
    if (!contentVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [contentVisible]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase >= 4 ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* ===== BACKGROUND PARTICLES ===== */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size2,
                  backgroundColor: i % 3 === 0 ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  y: [0, -20 - p.yOffset, -60],
                }}
                transition={{
                  delay: 0.3 + p.delay,
                  duration: 2.5 + p.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ===== OUTER SPINNING RINGS (complex motion design) ===== */}
          <div className="absolute flex items-center justify-center">
            {/* Ring 1 - Large, slow, dashed */}
            <motion.div
              className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full"
              style={{
                border: '1px dashed rgba(236,72,153,0.15)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 1 : 0,
                rotate: 360,
              }}
              transition={{
                scale: { duration: 0.8, ease: 'easeOut' },
                opacity: { duration: 0.5 },
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              }}
            />
            {/* Ring 2 - Medium, counter-rotate, dotted */}
            <motion.div
              className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full"
              style={{
                border: '1px solid rgba(236,72,153,0.08)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 1 : 0,
                rotate: -360,
              }}
              transition={{
                scale: { delay: 0.15, duration: 0.8, ease: 'easeOut' },
                opacity: { delay: 0.15, duration: 0.5 },
                rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
              }}
            />
            {/* Ring 3 - SVG ring with gradient stroke + animated dash */}
            <motion.svg
              className="absolute w-64 h-64 md:w-80 md:h-80"
              viewBox="0 0 200 200"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 0.6 : 0,
                rotate: 360,
              }}
              transition={{
                scale: { delay: 0.1, duration: 0.7 },
                opacity: { delay: 0.1, duration: 0.5 },
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              }}
            >
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="95"
                stroke="url(#ringGrad)"
                strokeWidth="0.8"
                fill="none"
                strokeDasharray="8 12"
              />
            </motion.svg>
            {/* Ring 4 - Tight inner ring, fast spin */}
            <motion.div
              className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full border border-white/[0.04]"
              initial={{ scale: 0 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                rotate: -360,
              }}
              transition={{
                scale: { delay: 0.2, duration: 0.6 },
                rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
              }}
            />
            {/* Ring 5 - Pulsing glow circle */}
            <motion.div
              className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
              }}
              initial={{ scale: 0 }}
              animate={{
                scale: phase >= 1 ? [1, 1.15, 1] : 0,
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute"
                style={{ width: 120 + i * 40, height: 120 + i * 40 }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: phase >= 1 ? 1 : 0,
                  rotate: i % 2 === 0 ? 360 : -360,
                }}
                transition={{
                  opacity: { delay: 0.3 + i * 0.1 },
                  rotate: { duration: 4 + i * 2, repeat: Infinity, ease: 'linear' },
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 3 - i * 0.5,
                    height: 3 - i * 0.5,
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: i % 2 === 0 ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.2)',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* ===== CENTER: LOGO ===== */}
          <div className="relative flex flex-col items-center z-10">
            {/* Logo SVG - based on real Prime Studio logo */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -15 }}
              animate={{
                scale: phase >= 1 ? 1 : 0,
                rotate: phase >= 1 ? 0 : -15,
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            >
              <svg
                className="w-36 h-36 md:w-44 md:h-44"
                viewBox="0 0 200 200"
                fill="none"
              >
                <defs>
                  <linearGradient id="splashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                {/* Camera body */}
                <motion.rect
                  x="40" y="60" width="120" height="80" rx="8"
                  stroke="url(#splashLogoGrad)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 1 ? 1 : 0 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
                {/* Viewfinder top bump */}
                <motion.path
                  d="M72 60 L78 48 L122 48 L128 60"
                  stroke="url(#splashLogoGrad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 1 ? 1 : 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />
                {/* Flash */}
                <motion.rect
                  x="45" y="50" width="15" height="10" rx="2"
                  fill="url(#splashLogoGrad)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: phase >= 1 ? 1 : 0,
                    scale: phase >= 1 ? 1 : 0,
                  }}
                  transition={{ delay: 0.7, duration: 0.4, type: 'spring' }}
                  style={{ transformOrigin: '52px 55px' }}
                />
                {/* Lens - outer */}
                <motion.circle
                  cx="100" cy="100" r="35"
                  stroke="url(#splashLogoGrad)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 1 ? 1 : 0 }}
                  transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
                />
                {/* Lens - inner ring */}
                <motion.circle
                  cx="100" cy="100" r="30"
                  stroke="url(#splashLogoGrad)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity={0.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 1 ? 1 : 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                />
                {/* Lens - iris blades (6 segments) */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (Math.PI * 2 * i) / 6;
                  const x1 = 100 + Math.cos(angle) * 15;
                  const y1 = 100 + Math.sin(angle) * 15;
                  const x2 = 100 + Math.cos(angle + 0.5) * 25;
                  const y2 = 100 + Math.sin(angle + 0.5) * 25;
                  return (
                    <motion.line
                      key={`iris-${i}`}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="url(#splashLogoGrad)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: phase >= 2 ? 1 : 0,
                        opacity: phase >= 2 ? 0.4 : 0,
                      }}
                      transition={{ delay: 0.15 * i, duration: 0.4 }}
                    />
                  );
                })}
                {/* Lens - center dot */}
                <motion.circle
                  cx="100" cy="100" r="8"
                  fill="url(#splashLogoGrad)"
                  initial={{ scale: 0 }}
                  animate={{ scale: phase >= 2 ? [0, 1.3, 1] : 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                  style={{ transformOrigin: '100px 100px' }}
                />
                {/* Shutter button */}
                <motion.circle
                  cx="165" cy="80" r="6"
                  fill="url(#splashLogoGrad)"
                  initial={{ scale: 0 }}
                  animate={{ scale: phase >= 1 ? 1 : 0 }}
                  transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
                  style={{ transformOrigin: '165px 80px' }}
                />
              </svg>

              {/* Shutter flash effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={
                  phase >= 3
                    ? { opacity: [0, 0.9, 0], scale: [0.6, 1.4, 1.8] }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Inner spinning ring around logo */}
              <motion.div
                className="absolute inset-[-8px] rounded-full"
                style={{
                  border: '1.5px solid transparent',
                  borderTopColor: 'rgba(236,72,153,0.4)',
                  borderRightColor: 'rgba(236,72,153,0.15)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              {/* Counter inner ring */}
              <motion.div
                className="absolute inset-[-16px] rounded-full"
                style={{
                  border: '1px solid transparent',
                  borderBottomColor: 'rgba(255,255,255,0.08)',
                  borderLeftColor: 'rgba(255,255,255,0.03)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* ===== BRAND NAME ===== */}
            <motion.div
              className="mt-7 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: phase >= 3 ? 1 : 0,
                y: phase >= 3 ? 0 : 20,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Letter by letter: PRIME STUDIO */}
              <div className="flex items-center justify-center gap-0.5">
                {'PRIME'.split('').map((letter, i) => (
                  <motion.span
                    key={`p-${i}`}
                    className="text-3xl md:text-5xl font-black tracking-[0.15em] text-white"
                    initial={{ opacity: 0, y: 15, rotateX: 90 }}
                    animate={{
                      opacity: phase >= 3 ? 1 : 0,
                      y: phase >= 3 ? 0 : 15,
                      rotateX: phase >= 3 ? 0 : 90,
                    }}
                    transition={{ delay: 0.08 * i, duration: 0.4, ease: 'easeOut' }}
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.span className="w-3 md:w-4" />
                {'STUDIO'.split('').map((letter, i) => (
                  <motion.span
                    key={`s-${i}`}
                    className="text-3xl md:text-5xl font-black tracking-[0.15em] bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 15, rotateX: 90 }}
                    animate={{
                      opacity: phase >= 3 ? 1 : 0,
                      y: phase >= 3 ? 0 : 15,
                      rotateX: phase >= 3 ? 0 : 90,
                    }}
                    transition={{ delay: 0.08 * (i + 6), duration: 0.4, ease: 'easeOut' }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* Animated underline */}
              <motion.div
                className="mt-3 mx-auto h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: phase >= 3 ? 220 : 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
              />

              {/* Tagline */}
              <motion.p
                className="text-[9px] md:text-[11px] text-gray-500 mt-2 tracking-[0.4em] uppercase font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 3 ? 1 : 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Photographie Professionnelle
              </motion.p>
            </motion.div>

            {/* Loading progress bar */}
            <motion.div
              className="mt-6 w-32 md:w-40 h-[2px] bg-white/[0.04] rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: phase >= 3 ? '100%' : '0%' }}
                transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}