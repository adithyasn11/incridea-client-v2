import { MapPin, Calendar, Users } from "lucide-react";
import type { PublicEvent } from "../../api/public";

import Glass from "../ui/Glass";
import { formatDate } from "../../utils/date";

const CATEGORY_THEMES = {
  TECHNICAL: {
    color: "#60a5fa",
    glow: "rgba(59, 130, 246, 0.5)",
    label: "TECH",
  },
  NON_TECHNICAL: {
    color: "#34d399",
    glow: "rgba(16, 185, 129, 0.5)",
    label: "NON-TECH",
  },
  CORE: { color: "#c084fc", glow: "rgba(168, 85, 247, 0.5)", label: "CORE" },
  SPECIAL: {
    color: "#fb7185",
    glow: "rgba(244, 63, 94, 0.5)",
    label: "SPECIAL",
  },
  DEFAULT: {
    color: "#cbd5e1",
    glow: "rgba(255, 255, 255, 0.2)",
    label: "EVENT",
  },
};

interface EventCardProps {
  event: PublicEvent;
  index: number;
}

const EventCard = ({ event, index }: EventCardProps) => {
  const firstRoundWithDate = event.rounds.find((round) => round.date);
  const theme =
    CATEGORY_THEMES[event.category as keyof typeof CATEGORY_THEMES] ||
    CATEGORY_THEMES.DEFAULT;

  const teamSizeText =
    event.minTeamSize === event.maxTeamSize
      ? event.minTeamSize === 1
        ? "Solo"
        : `${event.minTeamSize} per team`
      : `${event.minTeamSize}-${event.maxTeamSize} per team`;

  const maskImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1452 2447'%3E%3Cpath d='M80 0h1292c44 0 80 36 80 80v2050c0 44-36 80-80 80h-480c-40 0-70 30-90 65-30 55-50 172-110 172H80c-44 0-80-36-80-80V80C0 36 36 0 80 0z'/%3E%3C/svg%3E")`;

  return (
    <div
      className={`flex items-center justify-center p-4 font-sans animate-float hover:z-50 ${index % 2 !== 0 ? "lg:mt-24" : "mt-0"
        }`}
      style={{
        animationName: `floating${(index % 3) + 1}`,
        animationDuration: `${4 + (index % 3)}s`,
        animationDelay: `${(index * 2) % 5}s`,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      }}
    >
      <div className="relative w-[300px] aspect-[1452/2447.19] group">
        <div
          className="absolute inset-0 z-10"
          style={{
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          {/* Inner Content Area (Glass Effect) */}
          <Glass
            className="flex h-full w-full flex-col gap-[8px] p-[20px_16px_10px]"
          >
            <div className="mb-[6px] w-full aspect-1080/1350 rounded-[16px] overflow-hidden bg-black/20 border border-white/10">
              <img
                src={
                  event.image ||
                  "https://www.shutterstock.com/image-vector/girl-holding-open-book-reading-600nw-1470580109.jpg"
                }
                alt={event.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>

            {/* Event Name - Reduced slightly for better fit */}
            <div className="ml-1 mt-3 mb-1 text-[12px] font-bold uppercase tracking-[1.5px] text-white/90 truncate cursor-target">
              {event.name}
            </div>

            {/* Details */}
            <div className="mt-auto space-y-2 pb-5 pl-1 pr-1">
              {/* Date */}
              <div className="flex h-[32px] w-full items-center gap-[8px] rounded-md border border-white/5 bg-white/5 px-4 backdrop-blur-xs text-white/80">
                <Calendar size={12} className="opacity-70 shrink-0" />
                <span className="text-[10.5px] font-medium tracking-wide truncate">
                  {firstRoundWithDate
                    ? formatDate(firstRoundWithDate.date)
                    : "TBD"}
                </span>
              </div>

              {/* Team */}
              <div className="flex h-[32px] w-full items-center gap-[8px] rounded-md border border-white/5 bg-white/5 px-4 backdrop-blur-xs text-white/80">
                <Users size={12} className="opacity-70 shrink-0" />
                <span className="text-[10.5px] font-medium tracking-wide truncate">
                  {teamSizeText}
                </span>
              </div>

              {/* Location */}
              <div className="flex h-[32px] w-fit min-w-[100px] items-center gap-[8px] rounded-md border border-white/5 bg-white/5 px-4 backdrop-blur-xs text-white/80">
                <MapPin size={12} className="opacity-70 shrink-0" />
                <span className="text-[10.5px] font-medium tracking-wide truncate">
                  {event.venue || "NITTE"}
                </span>
              </div>
            </div>
          </Glass>
        </div>

        {/* Dynamic Category Tag - 1/4th size reduction + Theme Colors */}
        <div
          className="absolute bottom-[2.5%] right-[8%] text-[10px] tracking-[0.4em] font-black select-none pointer-events-none z-20 transition-all duration-700 uppercase"
          style={{
            color: theme.color,
            textShadow: `0 0 10px ${theme.glow}`,
            filter: `drop-shadow(0 0 2px ${theme.glow})`,
          }}
        >
          {theme.label}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
