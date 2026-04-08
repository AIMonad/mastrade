import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mastrade",
  description: "Real-time SOL Trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased system-ui-font">
        {children}
      </body>
    </html>
  );
}