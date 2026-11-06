import { useState, useRef, useCallback, useEffect } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#@%&|~';

interface ScrambleHookProps {
  text: string;
  duration?: number;
}

export const useScramble = ({ text, duration = 750 }: ScrambleHookProps) => {
  const [displayText, setDisplayText] = useState(text);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isScramblingRef = useRef(false);

  const getRandomChar = useCallback(() => {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }, []);

  const update = useCallback(() => {
    if (startTimeRef.current === null || !isScramblingRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      setDisplayText(text);
      isScramblingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    const newText = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        // Logic from original script: scramble all for 70% of duration, then reveal
        if (progress > 0.7) {
            const revealPoint = ((progress - 0.7) / 0.3) * text.length;
            return index < revealPoint ? text[index] : getRandomChar();
        }
        return getRandomChar();
    }).join('');

    setDisplayText(newText);
    timerRef.current = window.setTimeout(update, 50);

  }, [duration, text, getRandomChar]);

  const start = useCallback(() => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
    isScramblingRef.current = true;
    startTimeRef.current = Date.now();
    update();
  }, [update]);

  const stop = useCallback(() => {
    isScramblingRef.current = false;
    startTimeRef.current = null;
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
    setDisplayText(text);
  }, [text]);
  
  // When the source text changes, stop any animation and reset to the new text.
  useEffect(() => {
      stop();
  }, [text, stop]);

  return { displayText, start, stop };
};
