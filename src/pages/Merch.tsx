import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import LiquidGlassCard from "../components/liquidglass/LiquidGlassCard";
import MerchBuyModal from "../components/merch/MerchBuyModal";
import TShirt3DModel from "../components/merch/TShirt3DModel";
import shirt from "../assets/merch/shirt.svg";

const Merch = () => {
  const [showModal, setShowModal] = useState(false);

  const tshirtItem = {
    id: "tshirt",
    name: "Incridea T-Shirt",
    image: shirt,
    price: 499,
    description:
      "Premium quality Incridea event t-shirt. Made with comfortable cotton blend fabric. Perfect memorabilia from your event experience.",
    details: [
      "100% Premium Cotton Blend",
      "Comfortable fit and durable",
      "Available in 6 sizes (XS - XXL)",
      "Vibrant Incridea branding",
    ],
  };

  const handleBuyClick = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <motion.header
        className="mb-8 sm:mb-10 md:mb-12 text-center max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-black text-white tracking-tight">
          Merch Incridea
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          Exclusive merchandise to commemorate your Incridea experience.
        </p>
      </motion.header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LiquidGlassCard className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Left Panel - Product Info */}
              <div className="flex flex-col justify-center order-2 lg:order-1">
                <h2 className="text-4xl font-black text-white tracking-tight bg-clip-padding mb-4 sm:mb-6">
                  {tshirtItem.name}
                
                </h2>

                {/* Price Badge */}
                <div className="mb-4 sm:mb-6 inline-block w-fit">
                  <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-base sm:text-lg md:text-xl">
                    ₹{tshirtItem.price}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                  {tshirtItem.description}
                </p>

                {/* Details List */}
                <div className="mb-8 sm:mb-10">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wide">
                    Product Details
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {tshirtItem.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 sm:gap-3 text-gray-300 text-xs sm:text-sm md:text-base"
                      >
                        <span className="text-purple-400 font-bold mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buy Button */}
                <motion.button
                  onClick={handleBuyClick}
                  className="group w-full sm:w-full lg:w-auto flex items-center justify-center gap-2 rounded-full
                    px-6 sm:px-8 py-2.5 sm:py-3 capitalize text-white font-bold
                    bg-emerald-600 border border-emerald-500
                    backdrop-blur-2xl
                    shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_20px_rgba(52,211,153,0.4)]
                    hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.6),0_0_60px_rgba(52,211,153,0.3)]
                    transition-all duration-300
                    active:scale-[0.98]
                    relative overflow-hidden cursor-target
                    uppercase tracking-wider text-sm sm:text-base md:text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buy Now
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
                    <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md" />
                  </span>
                </motion.button>
              </div>

              {/* Right Panel - 3D Model Viewer */}
              <div className="flex items-center justify-center order-1 lg:order-2 min-h-[400px]">
                <motion.div
                  initial={{ scale: 0.9, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-full h-full min-h-[400px] flex items-center justify-center bg-black/80 rounded-xl border border-white/10 overflow-hidden"
                >
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex flex-col items-center justify-center p-8">
                        <div className="relative mb-6">
                          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        </div>
                        <img
                          src={shirt}
                          alt={tshirtItem.name}
                          className="w-48 h-48 object-contain opacity-30"
                        />
                        <p className="mt-4 text-gray-400 text-sm animate-pulse">Loading 3D Model...</p>
                      </div>
                    }
                  >
                    <TShirt3DModel modelPath="/models/shirt.glb" />
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* Modal */}
      <MerchBuyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productName={tshirtItem.name}
        productPrice={tshirtItem.price}
        productSize="M"
      />
    </div>
  );
};

export default Merch;
