import LightRays from '../components/LightRays'

const ComingSoon = () => {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#1a1026] via-[#0d0716] to-black">

      {/* ================= INLINE FONT (NO OTHER FILES TO TOUCH) ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .cs-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .character-glow {
          filter: brightness(0.95);
        }

        .character-glow:hover {
          filter:
            brightness(1.1)
            drop-shadow(0 0 25px rgba(140,120,255,0.35))
            drop-shadow(0 0 60px rgba(120,100,255,0.25));
          transform: translateY(-6px);
        }
      `}</style>

      {/* ================= LIGHT RAYS (FULL WIDTH, GOES OVER PHOTO) ================= */}
      <LightRays
        className="absolute inset-0"
        raysColor="#a78bfa"
        raysSpeed={0.45}
        lightSpread={0.9}
        rayLength={3.6}     // 🔥 longer rays
        fadeDistance={1.9}
        saturation={0.75}
        noiseAmount={0.12}
        distortion={0.05}
        followMouse={true}
      />

      {/* ================= CONTENT ================= */}
      <div className="cs-root relative z-10 flex h-full w-full">

        {/* LEFT SIDE */}
        <div className="flex h-full w-1/2 items-center">
          <div className="flex flex-col items-start pl-24">

            <div className="relative mb-4">
              <span className="absolute -left-10 -top-3 text-white/60 text-sm">
                ⌖
              </span>
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
        <div className="flex h-full w-1/2 items-center justify-center">
          <img
            src="/comingsoon/on.png"
            alt="Character"
            className="character-glow h-[80%] object-contain transition-all duration-700 ease-out"
          />
        </div>

      </div>
    </div>
  )
}

export default ComingSoon
