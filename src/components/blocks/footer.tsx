import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const services = [
    { name: "Lead Generation", href: "/#feature-modern-teams" },
    { name: "How It Works", href: "/#resource-allocation" },
    { name: "Pricing", href: "/pricing" },
  ];
  const company = [
    { name: "About Us", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];
  const social = [
    { name: "LinkedIn", href: "https://linkedin.com" },
    { name: "Email", href: "mailto:info@marketyleadgen.com" },
  ];
  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="border-t pt-20 pb-10">
      <div className="container">
        <div className="mb-20 flex flex-col items-start gap-6 rounded-3xl bg-muted p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-2xl tracking-tight md:text-3xl lg:text-4xl">
              Ready to start getting qualified leads?
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md leading-snug">
              Markety is the lead generation partner for businesses that are serious
              about growth. Let&apos;s build your pipeline.
            </p>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <a href="/contact">Get in touch</a>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/markety-logo.png"
                alt="Markety"
                width={38}
                height={13}
                className="rounded-md object-contain"
              />
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Full-service lead generation. Paid ads, landing pages, email follow-ups - all managed for you.
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold">Services</p>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold">Company</p>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold">Connect</p>
            <ul className="space-y-3">
              {social.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground"
                  >
                    {item.name} <ArrowUpRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row">
          <span>&copy; {new Date().getFullYear()} Markety. All rights reserved.</span>
          <ul className="flex gap-6">
            {legal.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
