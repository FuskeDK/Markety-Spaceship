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
          "from-primary/35 via-background to-background bg-linear-to-b via-30%",
        variant === "bottom" &&
          "from-background via-background to-primary/35 bg-linear-to-b via-70%",
        className,
      )}
    >
      {children}
    </div>
  );
};
