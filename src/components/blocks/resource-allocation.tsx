import Image from "next/image";

import { DashedLine } from "../dashed-line";

import { cn } from "@/lib/utils";
import type { SiteStrings } from "@/i18n/site-translations";

const topItems = [
  {
    title: "We learn your business.",
    description:
      "You tell us about your customers, sales process, and what a qualified lead looks like. No generic playbooks.",
    images: [
      {
        src: "/resource-allocation/templates.webp",
        alt: "Business onboarding",
        width: 495,
        height: 186,
      },
    ],
    className:
      "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: [""],
  },
  {
    title: "We build your system.",
    description: "Landing pages, email sequences, and ad campaigns - all built before anything goes live.",
    images: [
      { src: "/logos/claude.svg", alt: "Claude logo", width: 48, height: 48 },
      { src: "/logos/openai.svg", alt: "ChatGPT logo", width: 48, height: 48 },
      {
        src: "/logos/raycast.svg",
        alt: "Raycast logo",
        width: 48,
        height: 48,
      },
      { src: "/logos/vercel.svg", alt: "Vercel logo", width: 48, height: 48 },
      {
        src: "/logos/perplexity.svg",
        alt: "Perplexity logo",
        width: 48,
        height: 48,
      },
      {
        src: "/logos/arc.svg",
        alt: "Arc logo",
        width: 48,
        height: 48,
      },
      {
        src: "/logos/github.svg",
        alt: "GitHub logo",
        width: 48,
        height: 48,
      },
      { src: "/logos/claude.svg", alt: "Claude logo", width: 48, height: 48 },
    ],
    className:
      "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8 md:[&>.title-container]:translate-x-2 xl:[&>.title-container]:translate-x-4 [&>.title-container]:translate-x-0",
    fade: [],
  },
];

const bottomItems = [
  {
    title: "We go live and improve.",
    description:
      "Campaigns launch and we immediately start testing. Every week we analyse what's working and cut what isn't.",
    images: [
      {
        src: "/resource-allocation/graveyard.webp",
        alt: "Campaign optimisation",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
  {
    title: "Leads arrive, you close.",
    description:
      "Your sales team gets a steady stream of people who are already interested and fully qualified.",
    images: [
      {
        src: "/resource-allocation/discussions.webp",
        alt: "Lead conversations",
        width: 320,
        height: 103,
      },
    ],
    className:
      "justify-normal [&>.title-container]:mb-5 md:[&>.title-container]:mb-0 [&>.image-container]:flex-1 md:[&>.image-container]:place-items-center md:[&>.image-container]:-translate-y-3",
    fade: [""],
  },
  {
    title: "Transparent reporting.",
    description:
      "Know exactly what's performing, what each lead costs, and how your pipeline is growing.",
    images: [
      {
        src: "/resource-allocation/notifications.png",
        alt: "Campaign reporting",
        width: 305,
        height: 280,
      },
    ],
    className:
      "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8 xl:[&>.image-container]:translate-x-6 [&>.image-container]:translate-x-2",
    fade: ["bottom"],
  },
];

export const ResourceAllocation = ({ t }: { t: SiteStrings }) => {
  // Merge translated titles/descriptions into the static item configs
  const top = topItems.map((item, i) => ({ ...item, title: t.process.steps[i].title, description: t.process.steps[i].description }));
  const bottom = bottomItems.map((item, i) => ({ ...item, title: t.process.steps[i + 2].title, description: t.process.steps[i + 2].description }));

  return (
    <section id="resource-allocation" className="overflow-hidden pb-28 lg:pb-32">
      <div className="">
        <h2 className="container text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          {t.process.steps[0].title.replace(".", "")} &amp; more
        </h2>

        <div className="mt-8 md:mt-12 lg:mt-20">
          <DashedLine orientation="horizontal" className="container scale-x-105" />

          <div className="relative container flex max-md:flex-col">
            {top.map((item, i) => (
              <Item key={i} item={item} isLast={i === top.length - 1} />
            ))}
          </div>
          <DashedLine orientation="horizontal" className="container max-w-7xl scale-x-110" />

          <div className="relative container grid max-w-7xl md:grid-cols-3">
            {bottom.map((item, i) => (
              <Item key={i} item={item} isLast={i === bottom.length - 1} className="md:pb-0" />
            ))}
          </div>
        </div>
        <DashedLine orientation="horizontal" className="container max-w-7xl scale-x-110" />
      </div>
    </section>
  );
};

interface ItemProps {
  item: (typeof topItems)[number] | (typeof bottomItems)[number];
  isLast?: boolean;
  className?: string;
}

const Item = ({ item, isLast, className }: ItemProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between px-0 py-6 md:px-6 md:py-8",
        className,
        item.className,
      )}
    >
      <div className="title-container text-balance">
        <h3 className="inline font-semibold">{item.title} </h3>
        <span className="text-muted-foreground"> {item.description}</span>
      </div>

      {item.fade.includes("bottom") && (
        <div className="from-muted/80 absolute inset-0 z-10 bg-linear-to-t via-transparent to-transparent md:hidden" />
      )}
      {item.images.length > 4 ? (
        <div className="relative overflow-hidden">
          <div className="flex flex-col gap-5">
            {/* First row - right aligned */}
            <div className="flex translate-x-4 justify-end gap-5">
              {item.images.slice(0, 4).map((image, j) => (
                <div
                  key={j}
                  className="bg-background grid aspect-square size-16 place-items-center rounded-2xl p-2 lg:size-20"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="object-contain object-left-top"
                  />
                  <div className="from-muted/80 absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l to-transparent" />
                </div>
              ))}
            </div>
            {/* Second row - left aligned */}
            <div className="flex -translate-x-4 gap-5">
              {item.images.slice(4).map((image, j) => (
                <div
                  key={j}
                  className="bg-background grid aspect-square size-16 place-items-center rounded-2xl lg:size-20"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="object-contain object-left-top"
                  />
                  <div className="from-muted absolute inset-y-0 bottom-0 left-0 z-10 w-14 bg-linear-to-r to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="image-container grid grid-cols-1 gap-4">
          {item.images.map((image, j) => (
            <Image
              key={j}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="object-contain object-left-top"
            />
          ))}
        </div>
      )}

      {!isLast && (
        <>
          <DashedLine
            orientation="vertical"
            className="absolute top-0 right-0 max-md:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute inset-x-0 bottom-0 md:hidden"
          />
        </>
      )}
    </div>
  );
};
