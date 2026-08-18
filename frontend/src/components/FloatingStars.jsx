import React, { useState, useEffect, useMemo, useRef } from "react";

const FloatingStars = ({ warpSpeed = false }) => {
  const starCount = 120;

  // Precompute each star's static properties once
  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map(() => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = Math.random() * 3 + 1;

      // Direction vector pointing away from center — used for the warp streak
      const dx = (left - 50) * 8;
      const dy = (top - 50) * 8;

      return {
        size,
        left,
        top,
        dx,
        dy,
        baseDuration: Math.random() * 6 + 6, // normal twinkle duration
        delay: Math.random() * 6,
        opacity: Math.random() * 0.8 + 0.2,
      };
    });
  }, []);

  // speed: 1 = normal drift, higher = faster warp streaks
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef(null);

  useEffect(() => {
    const startSpeed = speed;
    const targetSpeed = warpSpeed ? 8 : 1;
    const rampDuration = warpSpeed ? 1600 : 700; // ms — accelerate slower, decelerate faster
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / rampDuration, 1);
      const eased = warpSpeed
        ? t * t                      // ease-in: gradual acceleration
        : 1 - Math.pow(1 - t, 2);    // ease-out: quick settle back to normal

      setSpeed(startSpeed + (targetSpeed - startSpeed) * eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warpSpeed]);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-[#020617]">
      <style>{`
        @keyframes star-warp {
          0%   { transform: translate(0, 0) scaleY(1); opacity: var(--o); }
          15%  { opacity: var(--o); }
          100% { transform: translate(var(--tx), var(--ty)) scaleY(2.4); opacity: 0; }
        }
      `}</style>

      {stars.map((s, i) => {
        const warpDuration = Math.max(0.12, s.baseDuration / speed);

        return (
          <span
            key={i}
            className={warpSpeed ? "" : "animate-star"}
            style={{
              position: "absolute",
              borderRadius: "9999px",
              background: "white",
              width: `${s.size}px`,
              height: `${s.size}px`,
              left: `${s.left}%`,
              top: `${s.top}%`,
              boxShadow: `0 0 ${s.size * 4}px rgba(255,255,255,0.8)`,
              "--o": s.opacity,
              "--tx": `${s.dx}px`,
              "--ty": `${s.dy}px`,
              animationName: warpSpeed ? "star-warp" : undefined,
              animationDuration: warpSpeed
                ? `${warpDuration}s`
                : `${s.baseDuration}s`,
              animationTimingFunction: warpSpeed ? "linear" : "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: warpSpeed ? `${(i % 20) * 0.03}s` : `${s.delay}s`,
              opacity: warpSpeed ? undefined : s.opacity,
            }}
          />
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black opacity-70" />
    </div>
  );
};

export default FloatingStars;