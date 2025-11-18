import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AptosWalletProvider } from "@/components/wallet/AptosWalletProvider";
import { NetworkMismatchWarning } from "@/components/wallet/NetworkMismatchWarning";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DATN - Decentralized Autonomous Trade Network.",
  description: "The Best Decentalized Goods Trade Network.",
  icons: {
    icon: "/xtra-games.png", // ✅ Correct path (public/xtra-games.png)
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AptosWalletProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                {/* Network Mismatch Warning */}
                <NetworkMismatchWarning />

                <div className="flex flex-col min-h-screen">
                  {/* Navigation Bar */}
                  <Navbar />

                  {/* Main Content */}
                  <main className="flex-1">
                    <ProtectedRoute>{children}</ProtectedRoute>
                  </main>

                  {/* Footer */}
                  <Footer />
                </div>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </AptosWalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
