import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AdminShortcutListener } from "@/components/app/admin-shortcut-listener";
import { AppProviders } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GossipAI Web",
  description: "GossipAI web application",
  icons: {
    icon: [
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/16.png", sizes: "16x16", type: "image/png" },
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/32.png", sizes: "32x32", type: "image/png" },
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/196.png", sizes: "196x196", type: "image/png" },
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/180.png", sizes: "180x180", type: "image/png" },
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/167.png", sizes: "167x167", type: "image/png" },
      { url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: [{ url: "/AppIcons/Assets.xcassets/AppIcon.appiconset/32.png", type: "image/png" }],
  },
};

const headingFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading-editorial",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body-editorial",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", headingFont.variable, bodyFont.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>
          <AdminShortcutListener />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
