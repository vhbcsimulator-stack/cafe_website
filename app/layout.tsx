import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Script from "next/script";

export const metadata: Metadata = {
  title: "VHermosa Cafe | Coffee Viewer",
  description: "Cinematic 3D Coffee Cup Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Navbar />
        <Script
          src="https://link.msgsndr.com/js/external-tracking.js"
          data-tracking-id="tk_60e86c7cfdfb4f728adc8de852ca0e4e"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
