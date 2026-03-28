import type { Metadata } from "next";
import "./globals.css";
import { AdminShortcutListener } from "@/components/app/admin-shortcut-listener";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GossipAI Web",
  description: "GossipAI web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            <AdminShortcutListener />
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
