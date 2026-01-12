import React from "react";
import { MapPin, Calendar, Users } from "lucide-react";
import type { PublicEvent } from "../../api/public";
import { formatDate } from "../../utils/date";

const CATEGORY_THEMES = {
  TECHNICAL: { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.8)" },
  NON_TECHNICAL: { color: "#10b981", glow: "rgba(16, 185, 129, 0.8)" },
  CORE: { color: "#a855f7", glow: "rgba(168, 85, 247, 0.8)" },
  SPECIAL: { color: "#f43f5e", glow: "rgba(244, 63, 94, 0.8)" },
  DEFAULT: { color: "#ffffff", glow: "rgba(255, 255, 255, 0.4)" },
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
      className={`flex items-center justify-center p-4 font-sans transition-all duration-500 hover:-translate-y-4 hover:z-50 ${index % 2 !== 0 ? "lg:mt-24" : "mt-0"
        }`}
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
          <div
            className="flex h-full w-full flex-col gap-[8px] border border-white/10 p-[20px_16px_10px] backdrop-blur-[20px] transition-all duration-500 group-hover:border-white/30"
            style={{
              backgroundColor: "rgba(18, 20, 28, 0.4)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 animate-shine bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.05)_50%,transparent_65%)] bg-[length:280%_100%]"
              style={{
                animationDuration: `${10 + (index % 5) * 2}s`,
                animationDelay: `${(index % 7) * 0.5}s`,
              }}
            />

            <div className="mb-[6px] w-full aspect-[1080/1350] rounded-[16px] overflow-hidden bg-black/40 border border-white/10">
              <img
                src="https://www.shutterstock.com/image-vector/girl-holding-open-book-reading-600nw-1470580109.jpg"
                alt={event.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>

            <div className="ml-1 mt-3 mb-1 text-[13px] font-bold uppercase tracking-[1.5px] text-white/90 truncate">
              {event.name}
            </div>

            <div className="mt-auto space-y-2 pb-5 pl-1 pr-1">
              {/* Date Tag - Less Rounded */}
              <div className="flex h-[32px] w-full items-center gap-[8px] rounded-md border border-white/10 bg-white/5 px-4 backdrop-blur-[4px] text-white">
                <Calendar size={13} className="opacity-80 shrink-0" />
                <span className="text-[11px] font-medium tracking-wide truncate">
                  {firstRoundWithDate
                    ? formatDate(firstRoundWithDate.date)
                    : "TBD"}
                </span>
              </div>

              {/* Team Tag - Less Rounded */}
              <div className="flex h-[32px] w-full items-center gap-[8px] rounded-md border border-white/10 bg-white/5 px-4 backdrop-blur-[4px] text-white">
                <Users size={13} className="opacity-80 shrink-0" />
                <span className="text-[11px] font-medium tracking-wide truncate">
                  {teamSizeText}
                </span>
              </div>

              {/* Location Tag - Less Rounded */}
              <div className="flex h-[32px] w-fit min-w-[100px] items-center gap-[8px] rounded-md border border-white/10 bg-white/5 px-4 backdrop-blur-[4px] text-white">
                <MapPin size={13} className="opacity-80 shrink-0" />
                <span className="text-[11px] font-medium tracking-wide truncate">
                  {event.venue || "NITTE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-[2%] right-[8%] text-[18px] tracking-[0.3em] font-bold select-none pointer-events-none z-20 transition-all duration-700 uppercase"
          style={{
            color: theme.color,
            opacity: 0.8,
          }}
        >
          {event.category === "NON_TECHNICAL"
            ? "N-TECH"
            : event.category === "TECHNICAL"
              ? "TECH"
              : event.category.split("_")[0]}
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shine {
          animation: shine 12s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default EventCard;