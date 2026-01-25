import { useState, useEffect } from "react";
import LightRays from "../components/LightRays";
import { useEffect, useRef, useState } from 'react';

const ComingSoon = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.2 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track mouse even if not hovering container, or stick to window
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate light direction for shadows
  const lightAngleX = (mousePos.x - 0.5) * 100;
  const lightAngleY = (mousePos.y - 0.2) * 50;
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#1a1026] via-[#0d0716] to-black">
      {/* ================= INLINE FONT (NO OTHER FILES TO TOUCH) ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes portalFlicker {
          0%, 33.33% {
            content: url('/comingsoon/on.png');
            opacity: 1;
          }
          33.34%, 100% {
            content: url('/comingsoon/off.png');
            opacity: 1;
          }
        }

        .cs-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .character-glow {
          animation: portalFlicker 3s infinite;
        }
      `}</style>

      {/* ================= LIGHT RAYS (FULL WIDTH, GOES OVER PHOTO) ================= */}
      <LightRays
        className="absolute inset-0"
        raysColor="#a78bfa"
        raysSpeed={0.75}
        lightSpread={0.25}
        rayLength={5}
        fadeDistance={1.4}
        saturation={0.9}
        noiseAmount={0.1}
        distortion={0.06}
        followMouse={true}
        mouseInfluence={0.35}
      />

      {/* ================= CONTENT ================= */}
      <div className="cs-root relative z-10 flex h-full w-full">
        {/* LEFT SIDE */}
        <div className="flex h-full w-1/2 items-center">
          <div className="flex flex-col items-start pl-24">
            <div className="relative mb-4">
              <h1 className="text-white text-[72px] font-semibold tracking-[0.28em] leading-none">
                PORTAL
              </h1>
            </div>

            <h2 className="ml-1 text-white/60 text-[22px] tracking-[0.45em] uppercase">
              IN
            </h2>

            <h1 className="mt-1 text-white text-[72px] font-semibold tracking-[0.28em] leading-none">
              PROGRESS
            </h1>

            <p className="mt-6 text-xs tracking-[0.4em] text-[#b8c6ff]">
              STAY TUNED
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex h-full w-1/2 items-center justify-center">
          <img
            src="/comingsoon/path.png"
            alt="Path"
            className="absolute bottom-[-2%] left-[100%] w-[250%] -translate-x-1/2 object-contain opacity-80 z-0 pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * -30}px), ${(mousePos.y - 0.5) * -30}px)`,
              filter: `brightness(${0.8 + (0.5 - mousePos.y) * 0.3}) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))`
            }}
          />
          <img
            src="/comingsoon/on.png"
            alt="Character"
            className="character-glow relative h-[80%] object-contain transition-all duration-100 ease-out z-10"
            style={{
              transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`,
              filter: `
                brightness(${1 + (0.5 - mousePos.y) * 0.4})
                contrast(1.1)
                drop-shadow(${-lightAngleX * 0.3}px ${-lightAngleY * 0.5}px 40px rgba(199, 125, 255, ${0.6 - mousePos.y * 0.3}))
                drop-shadow(${-lightAngleX * 0.5}px ${-lightAngleY * 0.8}px 80px rgba(157, 78, 221, ${0.4 - mousePos.y * 0.2}))
              `
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
