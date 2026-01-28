import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import LiquidGlassCard from "../components/liquidglass/LiquidGlassCard";
import MerchBuyModal from "../components/merch/MerchBuyModal";
import TShirt3DModel from "../components/merch/TShirt3DModel";
import shirt from "../assets/merch/shirt.svg";
import { Sparkles, Box, Shirt, Zap } from "lucide-react";

// Inline CSS for custom animations (shimmer & scan)
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-150%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  @keyframes scan {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  .animate-shimmer {
    animation: shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .animate-scan {
    animation: scan 4s linear infinite;
  }
`;

const Merch = () => {
  const [showModal, setShowModal] = useState(false);

  const tshirtItem = {
    id: "tshirt",
    name: "Incridea T-Shirt",
    edition: "MK-IV EDITION",
    price: 499,
    description:
      "Premium quality Incridea event t-shirt. Made with comfortable cotton blend fabric. Perfect memorabilia from your event experience.",
    details: [
      { icon: Box, text: "100% Premium Cotton Blend" },
      { icon: Zap, text: "Comfortable fit and durable" },
      { icon: Shirt, text: "Available in 6 sizes (XS - XXL)" },
      { icon: Sparkles, text: "Vibrant Incridea branding" },
    ],
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleBuyClick = () => {
    setShowModal(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* Inject custom styles */}
      <style>{styles}</style>

      {/* Background Image - Fixed and Full Screen */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/eventpagebg/eventbg2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-70" />
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          className="mb-8 sm:mb-12 text-center max-w-7xl mx-auto"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 tracking-tight uppercase drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] mb-4">
              Merch Incridea
            </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm md:text-base">&gt; Exclusive merchandise to commemorate your Incridea experience_</p>
        </motion.header>

        <div className="max-w-7xl mx-auto">
          {/* Grid Layout: Stacks on mobile (grid-cols-1), 2 columns on large screens (lg:grid-cols-2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT PANEL COLUMN */}
            <motion.div 
              className="order-2 lg:order-1 flex flex-col gap-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              
              {/* 1. Header Card */}
              <LiquidGlassCard className="p-6 md:p-8 !rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">
                  {tshirtItem.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <span className="text-emerald-400 font-mono text-xs sm:text-sm tracking-wider uppercase bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">
                    {tshirtItem.edition}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500 text-black font-bold text-[10px] sm:text-xs rounded-full uppercase tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                    Limited Stock
                  </span>
                </div>
              </LiquidGlassCard>

              {/* 2. Description */}
              <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light pl-2 border-l-2 border-white/10 ml-2">
                {tshirtItem.description}
              </p>

              {/* 3. Specs Card */}
              <LiquidGlassCard className="p-6 !rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Box className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-xs font-bold text-emerald-400 mb-6 uppercase tracking-widest font-mono flex items-center gap-2 relative z-10">
                  <Box className="w-4 h-4" />
                  Technical Specifications
                </h3>
                <div className="space-y-4 relative z-10">
                  {tshirtItem.details.map((detail, idx) => {
                    const Icon = detail.icon;
                    return (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                          <Icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-gray-300 text-sm font-light group-hover:text-white transition-colors">
                          {detail.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </LiquidGlassCard>

              {/* 4. Sizes Card */}
              <LiquidGlassCard className="p-6 !rounded-2xl">
                <h3 className="text-xs font-bold text-emerald-400 mb-4 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Sizes Available
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <div
                      key={size}
                      className="w-10 h-10 flex items-center justify-center rounded bg-white/5 text-gray-300 font-bold text-xs border border-white/10 hover:border-emerald-500/50 hover:text-white hover:bg-emerald-500/10 transition-all cursor-default"
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>

            </motion.div>

            {/* RIGHT PANEL - T-SHIRT CARD & BUTTON */}
            {/* Sticky on large screens, standard flow on mobile */}
            <motion.div 
              className="order-1 lg:order-2 lg:sticky lg:top-24 space-y-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* T-SHIRT 3D MODEL CARD */}
              <div className="relative w-full aspect-square bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center justify-center overflow-hidden group">
                  
                  {/* Purple glow background inside card */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-60" />

                  {/* Scanlines Animation */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(52,211,153,0.05)_50%,transparent_60%)] bg-[length:100%_200%] pointer-events-none animate-scan opacity-50" />

                  {/* 3D Model Viewer */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Suspense
                      fallback={
                        <div className="w-full h-full flex flex-col items-center justify-center p-8">
                          <div className="relative mb-6">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                          </div>
                          <img
                            src={shirt}
                            alt="T-Shirt"
                            className="w-48 h-48 object-contain opacity-30"
                          />
                          <p className="mt-4 text-gray-400 text-sm animate-pulse">Loading 3D Model...</p>
                        </div>
                      }
                    >
                      <TShirt3DModel modelPath="/models/shirt.glb" />
                    </Suspense>
                  </div>

                  {/* Text Label */}
                  <div className="absolute bottom-6 text-white font-serif text-lg sm:text-xl tracking-wide z-10 opacity-90">
                    T-Shirt
                  </div>
              </div>

              {/* PRICE & BUTTON ROW */}
              <div className="flex flex-col gap-4">
                 {/* BUY NOW BUTTON - Pill Shaped with Shimmer */}
                 <motion.button
                  onClick={handleBuyClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-4 bg-[#00a676] hover:bg-[#008f65] text-white font-black uppercase tracking-wide text-sm rounded-full shadow-[0_0_20px_rgba(0,166,118,0.4)] transition-all overflow-hidden group"
                >
                  <span className="relative z-10">BUY NOW</span>
                  {/* Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-shimmer" />
                </motion.button>

                {/* Price Display */}
                <div className="text-center bg-black/30 py-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-gray-400 text-xs sm:text-sm mr-3 font-mono uppercase tracking-wider">Total Price</span>
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹{tshirtItem.price}</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Modal */}
        <MerchBuyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          productName={tshirtItem.name}
          productPrice={tshirtItem.price}
        />
      </div>
    </div>
  );
};

export default Merch;
