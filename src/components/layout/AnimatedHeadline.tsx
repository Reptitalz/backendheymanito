
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const words = ['WhatsApp', 'Asistente'];
const animationDuration = 3000; // ms

const letterContainerVariants = {
  hidden: { opacity: 0 },
  visible: (i: number = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: i * 0.04 },
  }),
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { type: 'spring', damping: 12, stiffness: 200 },
  },
   exit: {
    opacity: 0,
    y: '-100%',
    transition: { type: 'spring', damping: 12, stiffness: 200 },
  },
};

export function AnimatedHeadline() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, animationDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={words[wordIndex]}
        variants={letterContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="inline-block text-primary"
      >
        {words[wordIndex].split('').map((char, index) => (
          <motion.span key={index} variants={letterVariants} className="inline-block">
            {char}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
