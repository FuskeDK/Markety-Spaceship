import React from "react";

import { cn } from "@/lib/utils";

type BackgroundProps = {
  children: React.ReactNode;
  variant?: "top" | "bottom";
  className?: string;
};

export const Background = ({
  children,
  variant = "top",
  className,
}: BackgroundProps) => {
  return (
    <div
      className={cn(
        "relative",
        variant === "top" &&
          "from-primary/50 via-background to-background/80 bg-linear-to-b via-20%",
        variant === "bottom" &&
          "from-background via-background to-primary/50 bg-linear-to-b",
        className,
      )}
    >
      {children}
    </div>
  );
};
