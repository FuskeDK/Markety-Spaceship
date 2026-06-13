import { cn } from "@/lib/utils";

interface DashedLineProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const DashedLine = ({
  orientation = "horizontal",
  className,
}: DashedLineProps) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "text-muted-foreground/60 relative",
        isHorizontal ? "h-px w-full" : "h-full w-px",
        className,
      )}
    >
      <div
        className={cn(
          isHorizontal
            ? [
                "h-px w-full",
                "bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,currentColor_3px,currentColor_9px)]",
                "[mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]",
              ]
            : [
                "h-full w-px",
                "bg-[repeating-linear-gradient(180deg,transparent,transparent_3px,currentColor_3px,currentColor_9px)]",
                "[mask-image:linear-gradient(180deg,transparent,black_20%,black_80%,transparent)]",
              ],
        )}
      />
    </div>
  );
};
