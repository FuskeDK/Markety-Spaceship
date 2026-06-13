import React from "react";

import Link from "next/link";

import { Facebook, Linkedin, Mail, MapPin, MessageSquare, Twitter } from "lucide-react";

import { ContactForm } from "@/components/blocks/contact-form";

export default function Contact() {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">

          <div className="lg:col-span-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Get in touch
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Let's talk.
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Tell us about your business. We will review your details and get back to you within one business day.
            </p>

            <div className="mt-10 space-y-8">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  What happens next
                </p>
                <ol className="space-y-4">
                  {[
                    "We review your details and put together a plan tailored to your business.",
                    "We reach out within one business day to discuss next steps.",
                    "Your first leads typically arrive within 7-14 days of going live.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 inline-flex size-5 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Contact details
                </p>
                <Link
                  href="mailto:info@marketyleadgen.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  info@marketyleadgen.com
                </Link>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  Denmark
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MessageSquare className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  Reply within 1 business day
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Follow us
                </p>
                <div className="flex gap-5">
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Facebook className="size-5" />
                  </Link>
                  <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="size-5" />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter className="size-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 md:p-8 lg:col-span-3">
            <h2 className="text-lg font-semibold">Send us a message</h2>
            <p className="text-muted-foreground mt-1 mb-6 text-sm">
              Fill in the form and we will get right back to you.
            </p>
            <ContactForm />
          </div>

        </div>
      </div>
    </section>
  );
}
