import { useState, useEffect, useRef } from "react";
import LightRays from "../components/LightRays";
import gradient from "../assets/gradient.png";
import bgOp from "../assets/bg-op.png";

const ComingSoon = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Reset to center default
  const initialOrientation = useRef<{ beta: number; gamma: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia('(max-width: 1280px)').matches);
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTouchRef = useRef(false);

  useEffect(() => {
    // Check if we need permission (iOS 13+)
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        setIsIOS(true);
      } else {
        setPermissionGranted(true); // Non-iOS doesn't need explicit permission usually
      }
    } catch (e) {
      // Fallback if DeviceOrientationEvent is missing or errors
      setPermissionGranted(true);
    }

    const handleTouchStart = () => {
      isTouchRef.current = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchRef.current || isMobile) return;
      // Track mouse even if not hovering container, or stick to window
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // If we haven't received valid data yet, don't update
      if (e.beta === null || e.gamma === null) return;

      if (!initialOrientation.current) {
        initialOrientation.current = { beta: e.beta, gamma: e.gamma };
        return;
      }

      // Calculate change from initial position
      // X axis (Gamma - Left/Right): +/- 30 degrees range
      const maxTilt = 30;
      const deltaGamma = e.gamma - initialOrientation.current.gamma;
      // Clamp delta to range [-30, 30], then map to [0, 1] (0.5 is center)
      const x = Math.min(Math.max((deltaGamma + maxTilt) / (maxTilt * 2), 0), 1);

      // Y axis (Beta - Front/Back): +/- 30 degrees range
      const deltaBeta = e.beta - initialOrientation.current.beta;
      const y = Math.min(Math.max((deltaBeta + maxTilt) / (maxTilt * 2), 0), 1);

      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, isMobile]);

  const handlePermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        }
      } catch (e) {
        console.error("Gyro permission failed", e);
      }
    }
  };

  // Calculate light direction for shadows
  const lightAngleX = (mousePos.x - 0.5) * 100;
  const lightAngleY = (mousePos.y - 0.5) * 100;

  return (
    
    <div className={`relative flex h-dvh w-full touch-none select-none overflow-hidden overscroll-none ${isMobile ? 'cursor-none' : ''}`}>
      <div 
        style={{
          backgroundImage: `url(${bgOp})`,
          animationDuration: '240s'
        }}
        className="fixed top-1/2 left-1/2 w-[125vmax] h-[125vmax] -translate-x-1/2 -translate-y-1/2 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat bg-black animate-spin" 
      />
            <div 
        style={{
          backgroundImage: `url(${gradient})`,
          animationDuration: '240s'
        }}
        className="fixed  -z-50  bg-cover bg-center bg-no-repeat animate-spin" 
      />
      {isIOS && !permissionGranted && (
        <button
          onClick={handlePermission}
          className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-medium tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10"
        >
          ENABLE MOTION
        </button>
      )}
      {/* ================= INLINE FONT (NO OTHER FILES TO TOUCH) ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        /* Default animation for mobile */
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

        /* Mobile behavior */
        @media (max-width: 1280px) {
          .character-glow {
            animation: portalFlicker 3s infinite;
          }
        }

        /* Desktop behavior */
        @media (min-width: 1281px) {
          .character-glow {
            content: url('/comingsoon/off.png');
            transition: content 0.3s;
            cursor: pointer;
          }
          .character-glow:hover {
            content: url('/comingsoon/on.png');
          }
        }
      `}</style>

      {/* ================= LIGHT RAYS (FULL WIDTH, GOES OVER PHOTO) ================= */}
      <LightRays
        className="absolute inset-0"
        raysColor={isMobile ? "#a78bfa" : "#a78bfa"}
        raysSpeed={0.75}
        lightSpread={isMobile ? 0.2 : 0.25}
        rayLength={isMobile ? 12 : 5}
        fadeDistance={1.4}
        saturation={0.9}
        noiseAmount={0.1}
        distortion={0.06}
        followMouse={!isMobile}
        mouseInfluence={0.35}
        originOffset={[0, 0]}
      />

      {/* ================= CONTENT ================= */}
      <div className="cs-root relative z-10 flex h-full w-full flex-col justify-between pt-20 xl:flex-row xl:justify-normal xl:pt-0">
        {/* LEFT SIDE */}
        <div className="flex h-auto w-full items-center md:pl-20 justify-center xl:h-full xl:w-1/2 xl:justify-start">
          <div className="flex flex-col items-center text-center pt-0 xl:items-start xl:text-left xl:pl-32 xl:pt-0">
            <img
              src="/incridea.png.png"
              alt="Incridea Logo"
              className="w-32 mb-8 xl:w-40 xl:mb-10 object-contain"
            />
            {/* ================= STYLES FOR GLITCH EFFECT ================= */}
            <style>{`
              @keyframes glitch {
                0% { transform: translate(0); text-shadow: none; }
                20% { transform: translate(-2px, 2px); text-shadow: 2px 2px 0px #9d4edd, -2px -2px 0px #e0aaff; }
                40% { transform: translate(2px, -2px); text-shadow: -2px 2px 0px #9d4edd, 2px -2px 0px #e0aaff; }
                60% { transform: translate(0); text-shadow: none; }
                80% { transform: translate(2px, 2px); text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5); }
                100% { transform: translate(0); text-shadow: none; }
              }
              .glitch-text:hover {
                animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
            
            <div className="relative mb-2 group cursor-default">
              <h1 className="glitch-text text-[32px] md:text-[40px] font-bold leading-none tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-br from-white via-[#e9d5ff] to-white/80 xl:text-[64px] drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                PORTAL
              </h1>
            </div>

            <div className="flex items-center gap-4 my-2 pl-2 opacity-80">
              <div className="h-px w-8 bg-linear-to-r from-transparent to-[#c084fc]" />
              <h2 className="text-sm md:text-base uppercase tracking-[0.5em] text-[#e9d5ff] font-medium drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]">
                IN
              </h2>
              <div className="h-px w-12 bg-linear-to-l from-transparent to-[#c084fc]" />
            </div>

            <div className="relative mt-2 mb-10 group/progress">
              <h1 className="glitch-text text-[32px] md:text-[40px] font-bold leading-none tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-br from-white via-[#e9d5ff] to-white/80 xl:text-[64px] drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover/progress:drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                PROGRESS
              </h1>
            </div>

            {/* Decorative Progress Bar */}
            <div className="w-full max-w-[200px] xl:max-w-[280px] space-y-3">
              <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] text-[#d8b4fe] font-mono opacity-80">
                <span className="animate-pulse">Initializing...</span>
                <span>87%</span>
              </div>
              <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full w-[87%] bg-linear-to-r from-[#7c3aed] via-[#c084fc] to-[#e879f9] shadow-[0_0_10px_rgba(192,132,252,0.8)] relative">
                  <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <p className="pt-2 text-[8px] tracking-[0.4em] text-[#a78bfa] xl:text-[9px] font-mono opacity-60 text-center xl:text-left">
                STAY TUNED // 2026
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex h-auto w-full items-center justify-center xl:h-full xl:w-1/2">
          <img
            src="/comingsoon/path.png"
            alt="Path"
            className="pointer-events-none absolute bottom-0 right-[-55%] left-auto z-0 w-[160%] object-contain opacity-80 xl:bottom-[-2%] xl:left-full xl:right-auto xl:w-[160%] xl:-translate-x-1/2"
            style={{
              transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * -30}px), ${(mousePos.y - 0.5) * -30}px)`,
              filter: `brightness(${isMobile ? 0.9 : 0.8 + (0.5 - mousePos.y) * 0.3}) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))`
            }}
          />
          <div style={{ pointerEvents: isMobile ? 'none' : 'auto', position: 'relative', zIndex: 10 }}>
            <img
              src="/comingsoon/on.png"
              alt="Character"
              className="character-glow h-[40vh] object-contain transition-all duration-100 ease-out xl:h-[70vh]"
              style={{
                transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`,
                filter: `
                  brightness(${isMobile ? 1 : 1 + (0.5 - mousePos.y) * 0.55})
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
