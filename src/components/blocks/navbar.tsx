"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/site-translations";

export const Navbar = ({ locale = "en" }: { locale?: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const t = getT(locale);

  // Prefix hrefs with locale path when we're in a locale context
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const lhref = (path: string) => `${localePrefix}${path}`;

  const ITEMS = [
    {
      label: t.nav.services,
      href: "#services",
      dropdownItems: [
        {
          title: locale === "da" ? "Leadgenerering" : locale === "de" ? "Lead-Generierung" : locale === "sv" ? "Leadgenerering" : locale === "no" ? "Leadgenerering" : "Lead Generation",
          href: lhref("/#feature-modern-teams"),
          description: locale === "da" ? "Kvalificerede leads leveret til dit salgsteam, klar til at lukke." : locale === "de" ? "Qualifizierte Leads für Ihr Vertriebsteam, bereit zum Abschluss." : locale === "sv" ? "Kvalificerade leads levererade till ditt säljteam." : locale === "no" ? "Kvalifiserte leads levert til salgsteamet ditt." : "Qualified leads delivered to your sales team, ready to close.",
        },
        {
          title: locale === "da" ? "Sådan fungerer det" : locale === "de" ? "So funktioniert es" : locale === "sv" ? "Så fungerar det" : locale === "no" ? "Slik fungerer det" : "How It Works",
          href: lhref("/#resource-allocation"),
          description: locale === "da" ? "Fire trin fra briefing til leads i din indbakke." : locale === "de" ? "Vier Schritte vom Briefing bis zu Leads in Ihrem Posteingang." : locale === "sv" ? "Fyra steg från briefing till leads i din inkorg." : locale === "no" ? "Fire steg fra briefing til leads i innboksen din." : "Four steps from briefing to leads in your inbox.",
        },
      ],
    },
    { label: t.nav.about, href: lhref("/about") },
    { label: t.nav.faq, href: lhref("/faq") },
    { label: t.nav.contact, href: lhref("/contact") },
  ];

  return (
    <section className="absolute inset-x-0 top-0 z-50">
      <div className="container flex items-center justify-between py-5">
        <Link href={lhref("/")} className="flex shrink-0 items-center">
          <Image
            src="/markety-logo.png"
            alt="Markety"
            width={38}
            height={13}
            className="object-contain rounded-md"
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="max-lg:hidden">
          <NavigationMenuList>
            {ITEMS.map((link) =>
              link.dropdownItems ? (
                <NavigationMenuItem key={link.label} className="">
                  <NavigationMenuTrigger className="data-[state=open]:bg-accent/50 bg-transparent! px-1.5 text-base font-semibold">
                    {link.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-[400px] space-y-2 p-4">
                      {link.dropdownItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="group hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none"
                            >
                              <div className="space-y-1.5 transition-transform duration-300 group-hover:translate-x-1">
                                <div className="text-sm leading-none font-medium">
                                  {item.title}
                                </div>
                                <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={link.label} className="">
                  <Link
                    href={link.href}
                    className={cn(
                      "relative bg-transparent px-1.5 text-base font-semibold transition-opacity hover:opacity-75",
                      pathname === link.href
                        ? "text-purple-600"
                        : "hover:opacity-75",
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href={lhref("/contact")} className="max-lg:hidden">
            <Button variant="outline">
              <span className="relative z-10">{t.nav.contactBtn}</span>
            </Button>
          </Link>
          <a
            href="mailto:info@marketyleadgen.com"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="size-4" />
            <span className="sr-only">Email us</span>
          </a>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            className="text-muted-foreground relative flex size-8 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
              <span aria-hidden="true" className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`} />
              <span aria-hidden="true" className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`} />
              <span aria-hidden="true" className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Navigation */}
      <div
        className={cn(
          "bg-background absolute inset-x-0 top-full flex flex-col border-b p-6 transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0",
        )}
      >
        <nav className="divide-border flex flex-1 flex-col divide-y">
          {ITEMS.map((link) =>
            link.dropdownItems ? (
              <div key={link.label} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  className="text-primary flex w-full items-center justify-between text-base font-medium"
                >
                  {link.label}
                  <ChevronRight className={cn("size-4 transition-transform duration-200", openDropdown === link.label ? "rotate-90" : "")} />
                </button>
                <div className={cn("overflow-hidden transition-all duration-300", openDropdown === link.label ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
                  <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                    {link.dropdownItems.map((item) => (
                      <Link key={item.title} href={item.href} className="group hover:bg-accent block rounded-md p-2 transition-colors" onClick={() => { setIsMenuOpen(false); setOpenDropdown(null); }}>
                        <div className="transition-transform duration-200 group-hover:translate-x-1">
                          <div className="text-primary font-medium">{item.title}</div>
                          <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={link.label} href={link.href} className={cn("text-primary hover:text-primary/80 py-4 text-base font-medium transition-colors first:pt-0 last:pb-0", pathname === link.href && "text-purple-600 font-semibold")} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </section>
  );
};
