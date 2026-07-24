import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutProviders from "@/components/ClientLayoutProviders";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VNR Pool - Hyperlocal Ride Pooling",
  description: "Exclusive ride-pooling for VNR VJIET students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1E1B2E] dark:text-gray-50 antialiased overflow-x-hidden`}
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
