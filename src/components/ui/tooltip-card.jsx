"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export const Tooltip = ({ content, children, containerClassName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [height, setHeight] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [isVisible, content]);

  const calculatePosition = (mouseX, mouseY) => {
    if (!contentRef.current || !containerRef.current) return { x: mouseX + 12, y: mouseY + 12 };
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 240;
    const tooltipHeight = contentRef.current.scrollHeight;
    const absoluteX = containerRect.left + mouseX;
    const absoluteY = containerRect.top + mouseY;
    let finalX = mouseX + 12, finalY = mouseY + 12;
    if (absoluteX + 12 + tooltipWidth > viewportWidth) finalX = mouseX - tooltipWidth - 12;
    if (absoluteX + finalX < 0) finalX = -containerRect.left + 12;
    if (absoluteY + 12 + tooltipHeight > viewportHeight) finalY = mouseY - tooltipHeight - 12;
    if (absoluteY + finalY < 0) finalY = -containerRect.top + 12;
    return { x: finalX, y: finalY };
  };

  const updateMousePosition = (mouseX, mouseY) => {
    setMouse({ x: mouseX, y: mouseY });
    setPosition(calculatePosition(mouseX, mouseY));
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", containerClassName)}
      onMouseEnter={(e) => { setIsVisible(true); const r = e.currentTarget.getBoundingClientRect(); updateMousePosition(e.clientX - r.left, e.clientY - r.top); }}
      onMouseLeave={() => { setMouse({ x: 0, y: 0 }); setPosition({ x: 0, y: 0 }); setIsVisible(false); }}
      onMouseMove={(e) => { if (!isVisible) return; const r = e.currentTarget.getBoundingClientRect(); updateMousePosition(e.clientX - r.left, e.clientY - r.top); }}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div key={String(isVisible)}
            initial={{ height: 0, opacity: 1 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-none absolute z-50 min-w-[15rem] overflow-hidden rounded-md border border-transparent bg-white shadow-sm ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-900 dark:shadow-white/10 dark:ring-white/5"
            style={{ top: position.y, left: position.x }}>
            <div ref={contentRef} className="p-2 text-sm text-neutral-600 md:p-4 dark:text-neutral-400">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
