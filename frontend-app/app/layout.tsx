import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { SessionProvider } from "@/components/session-provider";
import { BrandingProvider } from "@/components/branding-provider";
import { Toaster } from "@/components/ui/sonner";
import FloatingSupport from "@/components/floating-support";
import LiveDonationFeed from "@/components/live-donation-feed";

export const metadata: Metadata = {
  title: "Treetmi.id | Platform Dukungan Kreator Indonesia",
  description: "Terima dukungan dan donasi real-time untuk semua jenis kreator digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-semibold antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="treetmi-theme"
        >
          <SessionProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <BrandingProvider>
                  {children}
                  <Toaster position="top-center" />
                  <FloatingSupport />
                  <LiveDonationFeed />
                </BrandingProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
