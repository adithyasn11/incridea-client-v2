import {
  Home,
  Calendar,
  Image,
  Info,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const items = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Calendar, path: "/events", label: "Events" },
    { icon: Image, path: "/gallery", label: "Gallery" },
    { icon: Info, path: "/about", label: "About" },
    { icon: Phone, path: "/contact", label: "Contact" },
    { icon: ShieldCheck, path: "/privacy", label: "Privacy" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-[95%] max-w-[400px] md:w-auto md:max-w-none">
      <div
        className="
          flex items-center justify-between md:justify-start gap-1 px-2 py-2
          md:gap-3 md:px-4 md:py-3
          rounded-full
          bg-gradient-to-r from-purple-900/80 to-black/90
          backdrop-blur-xl
          shadow-[0_0_35px_rgba(168,85,247,0.45)]
        "
      >

        {/* NAV ITEMS */}
        <div className="flex items-center justify-around w-full md:w-auto md:justify-start md:gap-10">
          {items.map(({ icon: Icon, path, label }) => (
            <NavLink
              key={path}
              to={path}
              title={label}
              className={({ isActive }) => `
                h-9 px-2 md:h-10 md:px-4 rounded-full
                flex items-center gap-2
                text-xs md:text-sm font-medium
                transition-all duration-300
                shrink-0
                ${isActive
                  ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-[0_0_18px_rgba(168,85,247,0.6)]"
                  : "text-purple-200 hover:bg-purple-500/25 hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                }
              `}
            >
              <Icon size={16} />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
