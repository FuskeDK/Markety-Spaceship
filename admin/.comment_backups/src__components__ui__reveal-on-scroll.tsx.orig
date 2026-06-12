import React, { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  delay?: number; // ms
  direction?: "up" | "left" | "right" | "none" | "zoom";
  stagger?: number; // ms between child reveals
  targetSelector?: string | null; // CSS selector to pick reveal targets inside the wrapped content
};

const RevealOnScroll: React.FC<RevealProps> = ({
  children,
  className = "",
  once = true,
  threshold = 0.12,
  rootMargin = "0px 0px -10% 0px",
  delay = 0,
  direction = "up",
  stagger = 0,
  targetSelector = null,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            // handle staggered children if requested
            if ((stagger ?? 0) > 0) {
              // choose targets: prefer explicit selector, otherwise choose children
              let targets: HTMLElement[] = [];
              if (targetSelector) {
                const found = node.querySelectorAll(targetSelector);
                if (found.length) targets = Array.from(found) as HTMLElement[];
              }
              if (!targets.length) {
                const rootChildren = Array.from(node.children) as HTMLElement[];
                if (rootChildren.length > 1) targets = rootChildren;
                else if (rootChildren.length === 1) targets = Array.from(rootChildren[0].children) as HTMLElement[];
              }

              // Fallback to reveal wrapper itself
              if (!targets.length) targets = [node as HTMLElement];

              const baseDelay = delay ?? 0;
              targets.forEach((t, i) => {
                t.classList.add("reveal-target");
                try {
                  t.style.transitionDelay = `${baseDelay + i * (stagger ?? 0)}ms`;
                } catch (e) {
                  void e;
                }
                t.classList.add("revealed");
              });
            } else {
              setRevealed(true);
            }

            if (once && node) observer.unobserve(node);
          } else if (!once) {
            setRevealed(false);
            // if staggered children were used, remove revealed class
            if ((stagger ?? 0) > 0) {
              const targets = node.querySelectorAll(".reveal-target");
              targets.forEach((t) => t.classList.remove("revealed"));
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, stagger, targetSelector, delay]);

  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
      ? "reveal-right"
      : direction === "none"
      ? "reveal-none"
      : direction === "zoom"
      ? "reveal-zoom"
      : "reveal-up";

  const cssVarStyle = { ["--reveal-delay"]: `${delay}ms` } as unknown as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`reveal ${dirClass} ${revealed ? "revealed" : ""} ${className}`.trim()}
      style={cssVarStyle}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
