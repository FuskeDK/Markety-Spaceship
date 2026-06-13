import Image from "next/image";

import { cn } from "@/lib/utils";
import type { SiteStrings } from "@/i18n/site-translations";

const steps = [
  {
    images: [{ src: "/resource-allocation/templates.webp", alt: "Business onboarding", width: 495, height: 186 }],
    logoGrid: false,
    fade: false,
  },
  {
    images: [
      { src: "/logos/claude.svg", alt: "Claude", width: 48, height: 48 },
      { src: "/logos/openai.svg", alt: "ChatGPT", width: 48, height: 48 },
      { src: "/logos/raycast.svg", alt: "Raycast", width: 48, height: 48 },
      { src: "/logos/vercel.svg", alt: "Vercel", width: 48, height: 48 },
      { src: "/logos/perplexity.svg", alt: "Perplexity", width: 48, height: 48 },
      { src: "/logos/arc.svg", alt: "Arc", width: 48, height: 48 },
      { src: "/logos/github.svg", alt: "GitHub", width: 48, height: 48 },
      { src: "/logos/claude.svg", alt: "Claude", width: 48, height: 48 },
    ],
    logoGrid: true,
    fade: false,
  },
  {
    images: [{ src: "/resource-allocation/graveyard.webp", alt: "Campaign optimisation", width: 305, height: 280 }],
    logoGrid: false,
    fade: true,
  },
  {
    images: [{ src: "/resource-allocation/discussions.png", alt: "Lead conversations", width: 320, height: 103 }],
    logoGrid: false,
    fade: false,
  },
  {
    images: [{ src: "/resource-allocation/notifications.png", alt: "Campaign reporting", width: 305, height: 280 }],
    logoGrid: false,
    fade: true,
  },
];

export const ResourceAllocation = ({ t }: { t: SiteStrings }) => {
  return (
    <section id="resource-allocation" className="pb-28 lg:pb-32">
      <div className="container">
        <h2 className="text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          How we do it &amp; more
        </h2>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border lg:mt-16">
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {t.process.steps.map((step, i) => {
              const config = steps[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "bg-background flex flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-6 lg:p-8",
                    i === 4 && "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <span className="font-mono text-xs tracking-widest text-purple-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>

                  <div className="relative mt-auto hidden overflow-hidden sm:block">
                    {config.fade && (
                      <div className="from-background absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t to-transparent" />
                    )}
                    {config.logoGrid ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex translate-x-4 justify-end gap-4">
                          {config.images.slice(0, 4).map((img, j) => (
                            <div key={j} className="bg-muted grid aspect-square size-14 place-items-center rounded-xl p-2 lg:size-16">
                              <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="object-contain" />
                            </div>
                          ))}
                        </div>
                        <div className="flex -translate-x-4 gap-4">
                          {config.images.slice(4).map((img, j) => (
                            <div key={j} className="bg-muted grid aspect-square size-14 place-items-center rounded-xl p-2 lg:size-16">
                              <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="object-contain" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      config.images.map((img, j) => (
                        <Image
                          key={j}
                          src={img.src}
                          alt={img.alt}
                          width={img.width}
                          height={img.height}
                          className="object-contain object-left-top"
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
