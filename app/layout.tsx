import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutProviders from "@/components/ClientLayoutProviders";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], weight: ['400', '500', '700'] });

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
        className={`${inter.className} min-h-screen bg-[#F5F5F0] text-[#0B1F1C] dark:bg-[#0B1F1C] dark:text-[#F5F5F0] antialiased overflow-x-hidden`}
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
