import type { Metadata } from "next";
import "./globals.css";
import { AuthGuard } from './_auth-guard'

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
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}