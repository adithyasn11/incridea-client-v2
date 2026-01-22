import { NavLink } from "react-router-dom";
import { User } from "lucide-react";
import MobileMenu from "./MobileMenu";

interface NavbarProps {
  token: string | null;
  userName: string | null;
  onLogout: () => void;
  isLoading: boolean;
}

const Navbar = ({ token, userName, onLogout, isLoading }: NavbarProps) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 md:px-14 py-2 md:py-4 grid grid-cols-3 items-start bg-transparent">
      {/* Logo */}
      <NavLink to="/" className="inline-flex items-center ml-2 md:-ml-3 mt-4 md:mt-5">
        <img src="/i.png" alt="Incridea" className="h-16 md:h-20 w-auto" />
      </NavLink>

      {/* Center Links */}
      <div className="flex gap-6 md:gap-12 justify-center items-center -ml-5 md:-ml-10 mt-12 lg:mt-7">
        <NavLink
          to="/events"
          className={({ isActive }) =>
            `font-['Orbitron'] text-xl md:text-3xl tracking-wide md:tracking-widest font-bold uppercase transition-colors duration-300 cursor-target ${isActive ? "text-purple-400" : "text-white hover:text-purple-300"
            }`
          }
        >
          Events
        </NavLink>
        <NavLink
          to="/pronite"
          className={({ isActive }) =>
            `font-['Orbitron'] text-xl md:text-3xl tracking-wide md:tracking-widest font-bold uppercase transition-colors duration-300 cursor-target ${isActive ? "text-purple-400" : "text-white hover:text-purple-300"
            }`
          }
        >
          Pronite
        </NavLink>
      </div>

      {/* Right User Section */}
      <div className="flex items-center gap-2 md:gap-4 mt-10 lg:mt-8.5 ml-0 md:ml-60 justify-end">
        {token ? (
          <div className="flex items-center gap-2 md:gap-4">
            <a
              href={`${import.meta.env.VITE_MAIN_URL}/profile`}
              className="hidden md:flex items-center gap-2 text-white hover:text-purple-300 transition-colors font-['Orbitron'] text-sm  cursor-target"
              title="Profile"
            >
              <User size={18} />
              <span className="uppercase tracking-wide">{userName}</span>
            </a>
            <button
              onClick={onLogout}
              className="
                hidden md:block
                px-4 py-1.5 md:px-6 md:py-2 rounded-md
                bg-[#5b21b6] hover:bg-[#4c1d95]
                text-white font-['Orbitron'] font-bold tracking-wider text-sm md:text-sm
                uppercase
                transition-all duration-300
                skew-x-[-10deg]
                cursor-target
              "
              title="Logout"
            >
              <span className="block skew-x-10">Logout</span>
            </button>
          </div>
        ) : (
          !isLoading && (
            <NavLink
              to="/login"
              className="
                hidden md:block
                px-4 py-1.5 md:px-6 md:py-2 rounded-md
                bg-[#5b21b6] hover:bg-[#4c1d95]
                text-white font-['Orbitron'] font-bold tracking-wider text-sm md:text-sm
                uppercase
                transition-all duration-300
                skew-x-[-10deg]
                mt-1
              "
            >
              <span className="block skew-x-10 whitespace-nowrap">Sign In</span>
            </NavLink>
          )
        )}
        <MobileMenu onLogout={onLogout} isAuthenticated={!!token} />
      </div>
    </div>
  );
};

export default Navbar;
