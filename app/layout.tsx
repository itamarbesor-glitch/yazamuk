import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mintbox - Gift Stocks to Friends",
  description: "The modern way to gift stocks. Send the perfect present with Mintbox.",
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
