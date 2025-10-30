
'use client';

import { useState, useEffect } from 'react';

const words = ['WhatsApp', 'Bots'];
const animationDuration = 2500; // ms

export function AnimatedHeadline() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    }, animationDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-grid text-center overflow-hidden h-12 md:h-16 -mb-2 md:-mb-4">
      <span
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${wordIndex * 50}%)` }}
      >
        {words.map((word) => (
          <span key={word} className="flex items-center justify-center h-12 md:h-16 text-[#25D366]">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
