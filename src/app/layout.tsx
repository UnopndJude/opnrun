import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "opnrun registration",
  description: "Config-driven race registration for high-demand running events."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
