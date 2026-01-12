import {
  Home,
  Calendar,
  Image,
  Info,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const items = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Calendar, path: "/events", label: "Events" },
    { icon: Image, path: "/gallery", label: "Gallery" },
    { icon: Info, path: "/about", label: "About" },
    { icon: Phone, path: "/contact", label: "Contact" },
    { icon: ShieldCheck, path: "/privacy", label: "Privacy" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-[400px] md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:translate-x-0">
      <div
        className="
          flex flex-row justify-between items-center p-2 gap-1
          md:flex-col md:gap-6 md:p-3
          rounded-2xl
          bg-gradient-to-b from-purple-900/80 to-black/90
          backdrop-blur-xl
          shadow-[0_0_35px_rgba(168,85,247,0.5)]
        "
      >
        {items.map(({ icon: Icon, path, label }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            className={({ isActive }) => `
              w-10 h-10 md:w-11 md:h-11 rounded-xl
              flex items-center justify-center
              transition-all duration-300
              shrink-0
              ${isActive
                ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-[0_0_22px_rgba(168,85,247,0.5)]"
                : "bg-white/10 text-purple-200 hover:bg-purple-500/30 hover:shadow-[0_0_14px_rgba(168,85,247,0.5)]"
              }
            `}
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
