import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yazamuk - Stock Gifting Platform",
  description: "Gift stocks to your friends",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
