import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function HoverEffect({ items, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2", className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-1.5 h-full w-full cursor-pointer"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={item.onClick}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-emerald-500/[0.08] block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <div className={cn(
            "rounded-xl h-full w-full p-4 overflow-hidden",
            "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
            "group-hover:border-emerald-500/[0.25] group-hover:bg-white/[0.05]",
            "transition-all duration-300 shadow-xl shadow-black/20",
            "relative z-20"
          )}>
            <div className="relative z-50">
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                  "bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
                )}>
                  {item.icon}
                </div>
                {item.active !== false && (
                  <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {/* Title */}
              <h4 className="text-zinc-100 font-semibold text-sm tracking-wide">
                {item.title}
              </h4>
              {/* Description */}
              <p className="mt-1.5 text-zinc-500 text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
