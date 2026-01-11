import { useMemo } from 'react'

export default function TestPage() {
  const backgroundStyle = useMemo(() => {
    // Generate 4-5 random blobs for uneven, random look
    const blobs = Array.from({ length: 5 }).map(() => {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        // Size between 20% and 60%
        const size = 20 + Math.floor(Math.random() * 40); 
        // Deep / Darker purple shades
        const colors = ['#1a0b2e', '#120a1f', '#240a34', '#0f0518', '#1e0b24', '#2e0f35'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${size}%)`;
    }).join(', ');

    return {
        backgroundColor: '#000000',
        backgroundImage: blobs,
        // Removed screen blend mode for darker appearance
    };
  }, []);

  return (
    <div 
      className="flex flex-col items-center min-h-screen text-slate-50 w-full overflow-y-auto overflow-x-hidden transition-all duration-1000 ease-in-out py-20 gap-10"
      style={backgroundStyle}
    >
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-200 to-white">
                Glassmorphism Test
            </h1>
        </div>

        {/* Standard Size Examples (w-80 h-48) */}
        <div className="flex flex-wrap justify-center gap-10 px-4">
            
            {/* 1. Standard Glass */}
            <div className="group relative">
                <div className="absolute -top-6 left-0 text-sm text-slate-400">Standard Glass</div>
                <div className="relative w-80 h-48 rounded-3xl
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-xl flex items-center justify-center">
                    <span className="opacity-80 font-medium">Glass Card</span>
                </div>
            </div>

            {/* 2. Liquid Glass with Static Gradient */}
            <div className="group relative">
                <div className="absolute -top-6 left-0 text-sm text-slate-400">Liquid Gradient</div>
                <div className="relative w-80 h-48 rounded-3xl overflow-hidden
                            bg-white/20 backdrop-blur-lg
                            border border-white/30
                            shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                
                {/* Liquid gradient layer */}
                <div className="absolute inset-0 bg-linear-to-br
                            from-white/30 via-white/10 to-transparent
                            opacity-10"></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 text-white h-full flex items-center justify-center">
                    Liquid Glass
                </div>
                </div>
            </div>

            {/* 3. Liquid Glass with Animation (Combining snippets) */}
            <div className="group relative">
                 <div className="absolute -top-6 left-0 text-sm text-slate-400">Animated Liquid</div>
                 <div className="relative w-80 h-48 rounded-3xl overflow-hidden
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-[0_0_40px_rgba(255,255,255,0.25)]">

                    {/* Animated Liquid Layer */}
                    <div className="absolute inset-0 bg-linear-to-r
                                from-white/40 via-transparent to-white/40
                                opacity-30 animate-liquid"></div>

                    <div className="relative z-10 p-6 text-white h-full flex items-center justify-center">
                        Animated Liquid
                    </div>
                </div>
            </div>

             {/* 4. Pulse Animation */}
             <div className="group relative">
                 <div className="absolute -top-6 left-0 text-sm text-slate-400">Pulse Overlay</div>
                 <div className="relative w-80 h-48 rounded-3xl overflow-hidden
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-xl">

                    <div className="absolute inset-0
                                bg-linear-to-r from-white/40 via-transparent to-white/40
                                opacity-10 animate-pulse">
                    </div>
                    <div className="relative z-10 p-6 text-white h-full flex items-center justify-center">
                        Pulse
                    </div>
                </div>
            </div>

            {/* 5. Dark Glass */}
            <div className="group relative">
                <div className="absolute -top-6 left-0 text-sm text-slate-400">Dark Glass</div>
                <div className="bg-black/30 backdrop-blur-xl
                            border border-white/10
                            shadow-[0_0_30px_rgba(0,255,255,0.15)]
                            rounded-3xl w-80 h-48 flex items-center justify-center">
                     <span className="opacity-80 font-medium text-cyan-100">Dark Glass</span>
                </div>
            </div>

            {/* 6. User Requested Liquid Glass */}
            <div className="group relative">
                <div className="absolute -top-6 left-0 text-sm text-slate-400">Liquid Glass</div>
                <div className="relative w-80 h-48 rounded-3xl overflow-hidden
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-[0_0_40px_rgba(255,255,255,0.25)]">

                    {/* Liquid flow animation layer */}
                    <div className="absolute inset-0
                                bg-linear-to-r from-white/40 via-transparent to-white/40
                                opacity-30 animate-pulse"></div>

                    {/* Glass highlight layer */}
                    <div className="absolute inset-0
                                bg-linear-to-br from-white/30 via-white/10 to-transparent
                                opacity-70"></div>

                    {/* Content */}
                    <div className="relative z-10 p-6 text-white font-semibold">
                        Liquid Glass
                    </div>
                </div>
            </div>

            {/* 7. Image Liquid Glass Request */}
            <div className="group relative">
                <div className="absolute -top-6 left-0 text-sm text-slate-400">Image Liquid Glass</div>
                <div className="relative w-80 h-48 rounded-3xl overflow-hidden
                            bg-white/10 backdrop-blur-2xl
                            border border-white/20
                            shadow-[0_0_30px_rgba(255,255,255,0.15)]
                            flex items-center justify-center">
                    
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent opacity-60 z-20 pointer-events-none"></div>
                    
                    {/* Subtle animating liquid/gradient background to make the glass pop */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-30 z-0"></div>

                    {/* Image */}
                    <img 
                        src="https://96ivv88bg9.ufs.sh/f/0yks13NtToBiT6fs7qa3jkzt82J06HowfZviEDRBg1y4eIpU" 
                        alt="Liquid Glass Effect" 
                        className="h-32 w-auto object-contain relative z-10 drop-shadow-2xl opacity-90"
                    />
                </div>
            </div>
        </div>

        {/* 100px Square Variants */}
        <div className="w-full max-w-5xl px-4 mt-12">
            <h2 className="text-xl font-semibold mb-8 text-slate-300 border-b border-slate-800 pb-2">100px Square Variants</h2>
            <div className="flex flex-wrap gap-8">
                
                {/* Square 1 */}
                <div className="w-[100px] h-[100px] rounded-2xl
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-xl flex items-center justify-center text-xs">
                    Square
                </div>

                {/* Square 2 (Deep Liquid) */}
                <div className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center text-xs">
                     <div className="absolute inset-0 bg-linear-to-br
                            from-white/30 via-white/10 to-transparent
                            opacity-70"></div>
                     <span className="relative z-10">Liquid</span>
                </div>

                {/* Square 3 (Animated Liquid) */}
                <div className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden
                            bg-white/20 backdrop-blur-xl
                            border border-white/30
                            shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center text-xs">
                     <div className="absolute inset-0 bg-linear-to-r
                                from-white/40 via-transparent to-white/40
                                opacity-30 animate-liquid"></div>
                     <span className="relative z-10">Anim</span>
                </div>

                {/* Square 4 (Dark) */}
                <div className="bg-black/80 backdrop-blur-xl
                            border border-white/10
                            shadow-[0_0_15px_rgba(0,255,255,0.15)]
                            rounded-2xl w-[100px] h-[100px] flex items-center justify-center text-xs text-cyan-100">
                    Dark
                </div>

            </div>
        </div>
    </div>
  )
}
