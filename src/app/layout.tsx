import { Inter } from "next/font/google";
import localFont from "next/font/local";

import type { Metadata } from "next";

import { StyleGlideProvider } from "@/components/styleglide-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

const dmSans = localFont({
  src: [
    {
      path: "../../fonts/dm-sans/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Markety - Qualified Lead Generation",
    template: "%s | Markety",
  },
  description:
    "Markety is a lead generation agency that builds and manages your full acquisition system - paid ads, landing pages, and email follow-ups.",
  keywords: [
    "lead generation",
    "digital marketing",
    "paid ads",
    "email marketing",
    "landing pages",
    "qualified leads",
    "marketing agency",
    "Denmark",
  ],
  authors: [{ name: "Markety" }],
  creator: "Markety",
  publisher: "Markety",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/MarketySquare.png", sizes: "512x512", type: "image/png" },
      { url: "/MarketySquare.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [{ url: "/MarketySquare.png", sizes: "180x180" }],
    shortcut: [{ url: "/MarketySquare.png" }],
  },
  openGraph: {
    title: "Markety - Qualified Lead Generation",
    description:
      "Markety is a lead generation agency that builds and manages your full acquisition system - paid ads, landing pages, and email follow-ups.",
    siteName: "Markety",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Markety - Qualified Lead Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markety - Qualified Lead Generation",
    description:
      "Markety is a lead generation agency that builds and manages your full acquisition system - paid ads, landing pages, and email follow-ups.",
    images: ["/og-image.jpg"],
    creator: "@markety",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body className={`${dmSans.variable} ${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StyleGlideProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
