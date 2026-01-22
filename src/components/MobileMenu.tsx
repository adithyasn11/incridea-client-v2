import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Home, Calendar, Image, Info, Phone, ShieldCheck, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
    onLogout: () => void;
    isAuthenticated: boolean;
}

const MobileMenu = ({ onLogout, isAuthenticated }: MobileMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const links = [
        { icon: Home, path: "/", label: "Home" },
        { icon: Calendar, path: "/events", label: "Events" },
        { icon: Image, path: "/gallery", label: "Gallery" },
        { icon: Info, path: "/about", label: "About" },
        { icon: Phone, path: "/contact", label: "Contact" },
        { icon: ShieldCheck, path: "/privacy", label: "Privacy" },
    ];

    return (
        <div className="md:hidden">
            {/* Toggle Button - Now flows with parent layout for alignment */}
            <button
                onClick={toggleMenu}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:text-purple-300 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
                <Menu size={24} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            onClick={toggleMenu}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[65vw] sm:w-1/2 z-50 bg-white/10 backdrop-blur-2xl border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col pt-6 pb-10 px-6 overflow-y-auto"
                        >
                            {/* Close Button Inside Drawer */}
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                {links.map(({ icon: Icon, path, label }) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        onClick={toggleMenu}
                                        className={({ isActive }) =>
                                            `relative group flex items-center gap-4 p-4 text-xl font-['Orbitron'] font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden ${isActive ? "text-purple-400" : "text-white/80 hover:text-white"
                                            }`
                                        }
                                    >
                                        {() => (
                                            <>
                                                <span className="absolute inset-0 bg-violet-600/20 -skew-x-12 transition-transform duration-300 -translate-x-[120%] group-hover:translate-x-0" />
                                                <span className="relative z-10 flex items-center gap-4">
                                                    <Icon size={20} />
                                                    {label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}

                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-4" />

                                {isAuthenticated ? (
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            toggleMenu();
                                        }}
                                        className="
                      px-4 py-2 rounded-md
                      bg-[#5b21b6] hover:bg-[#4c1d95]
                      text-white font-['Orbitron'] font-bold tracking-wider text-sm
                      uppercase
                      transition-all duration-300
                      skew-x-[-10deg]
                      flex items-center justify-center gap-2
                      w-full
                    "
                                    >
                                        <span className="skew-x-10 flex items-center gap-2">
                                            <LogOut size={20} />
                                            Logout
                                        </span>
                                    </button>
                                ) : (
                                    <NavLink
                                        to="/login"
                                        onClick={toggleMenu}
                                        className="
                      px-4 py-2 rounded-md
                      bg-[#5b21b6] hover:bg-[#4c1d95]
                      text-white font-['Orbitron'] font-bold tracking-wider text-sm
                      uppercase
                      transition-all duration-300
                      skew-x-[-10deg]
                      flex items-center justify-center gap-2
                      w-full
                    "
                                    >
                                        <span className="skew-x-10">Sign In</span>
                                    </NavLink>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileMenu;
