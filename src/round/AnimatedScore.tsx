import React, { useEffect, useState } from 'react';

interface AnimatedScoreProps {
  readonly targetScore: number;
  readonly duration?: number;
}

export function AnimatedScore({ targetScore, duration = 1000 }: AnimatedScoreProps): React.ReactElement {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetScore === 0) {
      setDisplayScore(0);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startScore = displayScore;
    const scoreDiff = targetScore - startScore;

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentScore = Math.floor(startScore + scoreDiff * easeOutCubic);
      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [targetScore, duration, displayScore]);

  return (
    <span className={`transition-all ${isAnimating ? 'text-yellow-400 scale-110' : ''}`}>
      {displayScore}
    </span>
  );
}