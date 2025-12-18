import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Short Generator",
  description: "Tools untuk generate ide & naskah video short",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
