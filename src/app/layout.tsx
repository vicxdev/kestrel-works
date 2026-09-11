import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kestrel Works",
  description:
    "An operations studio that builds the systems companies run on. A portfolio build with fictional clients.",
  openGraph: {
    title: "Kestrel Works",
    description:
      "An operations studio that builds the systems companies run on. A portfolio build with fictional clients.",
    siteName: "Kestrel Works",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
