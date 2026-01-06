import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";

export const metadata: Metadata = {
  title: "Cryptoguard — AI Crypto Fraud Detection",
  description: "Futuristic, real-time AI fraud detection with globe visualization, live feed, analytics, and neon-gold UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="0ad00823-3ee5-4e7f-969c-c69c567a8b0d"
        />
        <ThemeProvider>
          <AuthProvider>
            {children}
            <VisualEditsMessenger />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
