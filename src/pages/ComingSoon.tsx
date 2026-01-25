import { useState, useEffect } from "react";
import LightRays from "../components/LightRays";

const ComingSoon = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Reset to center default


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track mouse even if not hovering container, or stick to window
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      // Gamma: Left/Right tilt [-90, 90]
      // Map -25 to 25 degrees to 0-1 for X axis
      const gamma = Math.max(-25, Math.min(25, e.gamma));
      const x = (gamma + 25) / 50;

      // Beta: Front/Back tilt [-180, 180]
      // Map 20 to 70 degrees to 0-1 for Y axis (holding phone at ~45 deg)
      const beta = Math.max(20, Math.min(70, e.beta));
      const y = (beta - 20) / 50;

      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate light direction for shadows
  const lightAngleX = (mousePos.x - 0.5) * 100;
  const lightAngleY = (mousePos.y - 0.5) * 100;

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
      <div className="cs-root relative z-10 flex h-full w-full flex-col justify-between pt-20 lg:flex-row lg:justify-normal lg:pt-0">
        {/* LEFT SIDE */}
        <div className="flex h-auto w-full items-center justify-center lg:h-full lg:w-1/2 lg:justify-start">
          <div className="flex flex-col items-center text-center pt-0 lg:items-start lg:text-left lg:pl-24 lg:pt-0">
            <div className="relative mb-4">

              <h1 className="text-[40px] font-semibold leading-none tracking-[0.28em] text-white lg:text-[72px]">
                PORTAL
              </h1>
            </div>

            <h2 className="ml-1 text-lg uppercase tracking-[0.45em] text-white/60 lg:text-[22px]">
              IN
            </h2>

            <h1 className="mt-1 text-[40px] font-semibold leading-none tracking-[0.28em] text-white lg:text-[72px]">
              PROGRESS
            </h1>

            <p className="mt-6 text-[10px] tracking-[0.4em] text-[#b8c6ff] lg:text-xs">
              STAY TUNED
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex h-auto w-full items-center justify-center lg:h-full lg:w-1/2">
          <img
            src="/comingsoon/path.png"
            alt="Path"
            className="pointer-events-none absolute bottom-0 right-[-55%] left-auto z-0 w-[160%] object-contain opacity-80 lg:bottom-[-2%] lg:left-[100%] lg:right-auto lg:w-[160%] lg:-translate-x-1/2"
            style={{
              transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * -30}px), ${(mousePos.y - 0.5) * -30}px)`,
              filter: `brightness(${0.8 + (0.5 - mousePos.y) * 0.3}) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))`
            }}
          />
          <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 10 }}>
            <img
              src="/comingsoon/on.png"
              alt="Character"
              className="character-glow h-[40vh] object-contain transition-all duration-100 ease-out lg:h-[70vh]"
              style={{
                transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`,
                filter: `
                  brightness(${1 + (0.5 - mousePos.y) * 0.55})
                  contrast(1.15)
                  saturate(1.1)
                  drop-shadow(${-lightAngleX * 0.4}px ${-lightAngleY * 0.6}px 50px rgba(199, 125, 255, ${0.5 - mousePos.y * 0.25}))
                  drop-shadow(${-lightAngleX * 0.6}px ${-lightAngleY * 1}px 100px rgba(157, 78, 221, ${0.35 - mousePos.y * 0.18}))
                  drop-shadow(${-lightAngleX * 0.8}px ${-lightAngleY * 1.2}px 150px rgba(140, 69, 255, ${0.2 - mousePos.y * 0.1}))
                `,
                transition: 'filter 0.1s ease-out', // Only transition filter, let transform be handled by class or separate
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
