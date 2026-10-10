import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./kinetic-stadium.css";

export const metadata: Metadata = {
  title: "SportsConnect — Your talent. Your team. Your future.",
  description: "A professional network for athletes, coaches, clubs and sports associations."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8FAFC"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
