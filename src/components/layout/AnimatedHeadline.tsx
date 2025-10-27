
'use client';

import { useState, useEffect } from 'react';

const words = ['WhatsApp', 'Bot'];
const typingSpeed = 150;
const deletingSpeed = 100;
const delay = 2000;

export function AnimatedHeadline() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const handleTyping = () => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
      } else {
        setText(currentWord.substring(0, text.length + 1));
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    if (!isDeleting && text === currentWord) {
      setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(typingTimeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <span className="inline-block bg-primary/20 border border-primary/50 rounded-lg px-4 py-1 relative min-w-[200px] md:min-w-[280px]">
      <span className="bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">
        {text}
      </span>
      <span className="animate-blink border-l-2 border-white absolute right-4 top-1/2 -translate-y-1/2 h-3/4"></span>
    </span>
  );
}
