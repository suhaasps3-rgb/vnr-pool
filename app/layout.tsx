import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayoutProviders from "@/components/ClientLayoutProviders";
import { ThemeProvider } from "@/components/ThemeProvider";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'], variable: '--font-display' });

export const metadata: Metadata = {
  title: "VNR Pool - Hyperlocal Ride Pooling",
  description: "Exclusive ride-pooling for VNR VJIET students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VNR Pool",
  },
};

export const viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.className} ${display.variable} min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayoutProviders>
            {children}
          </ClientLayoutProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
