import Image from "next/image";
import Link from "next/link";

import Marquee from "react-fast-marquee";

import { cn } from "@/lib/utils";

type Company = {
  name: string;
  logo: string;
  width: number;
  height: number;
  href: string;
};

export const Logos = () => {
  const topRowCompanies = [
    {
      name: "Claude",
      logo: "/logos/claude.svg",
      width: 110,
      height: 28,
      href: "https://claude.ai",
    },
    {
      name: "ChatGPT",
      logo: "/logos/openai.svg",
      width: 110,
      height: 28,
      href: "https://chatgpt.com",
    },
    {
      name: "Raycast",
      logo: "/logos/raycast.svg",
      width: 128,
      height: 33,
      href: "https://raycast.com",
    },
  ];

  const bottomRowCompanies = [
    {
      name: "Vercel",
      logo: "/logos/vercel.svg",
      width: 110,
      height: 28,
      href: "https://vercel.com",
    },
    {
      name: "GitHub",
      logo: "/logos/github.svg",
      width: 110,
      height: 28,
      href: "https://github.com",
    },
  ];

  return (
    <section className="pb-28 lg:pb-32 overflow-hidden">
      <div className="container space-y-10 lg:space-y-16">
        <div className="text-center">
          <h2 className="mb-4 text-xl text-balance md:text-2xl lg:text-3xl">
            Softwares we use and love.
          </h2>
        </div>

        <div className="flex w-full flex-col items-center gap-8">
          {/* Top row - 3 logos */}
          <LogoRow companies={topRowCompanies} gridClassName="grid-cols-3" />

          {/* Bottom row - 2 logos */}
          <LogoRow
            companies={bottomRowCompanies}
            gridClassName="grid-cols-2"
            direction="right"
          />
        </div>
      </div>
    </section>
  );
};

type LogoRowProps = {
  companies: Company[];
  gridClassName: string;
  direction?: "left" | "right";
};

const LogoRow = ({ companies, gridClassName, direction }: LogoRowProps) => {
  return (
    <>
      {/* Desktop static version */}
      <div className="hidden md:block">
        <div
          className={cn(
            "grid items-center justify-items-center gap-x-20 lg:gap-x-28",
            gridClassName,
          )}
        >
          {companies.map((company, index) => (
            <Link href={company.href} target="_blank" key={index}>
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={company.width}
                height={company.height}
                className="dark:opacity/100 object-contain opacity-50 transition-opacity hover:opacity-70 dark:invert"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile marquee version */}
      <div className="md:hidden">
        <Marquee direction={direction} pauseOnHover>
          {companies.map((company, index) => (
            <Link
              href={company.href}
              target="_blank"
              key={index}
              className="mx-8 inline-block transition-opacity hover:opacity-70"
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={company.width}
                height={company.height}
                className="object-contain"
              />
            </Link>
          ))}
        </Marquee>
      </div>
    </>
  );
};
