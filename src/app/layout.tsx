import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const vt323 = VT323({
  variable: "--font-retro",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muhammad Moiz ul haq // Unreal Engine Developer",
  description:
    "Portfolio of Muhammad Moiz ul haq — Unreal Engine / C++ Developer. Specializing in gameplay systems, multiplayer networking, and immersive experiences. Remote worldwide.",
  keywords: [
    "Unreal Engine",
    "C++",
    "Game Developer",
    "Muhammad Moiz ul haq",
    "Multiplayer",
    "Gameplay Programming",
    "Portfolio",
  ],
  authors: [{ name: "Muhammad Moiz ul haq" }],
  openGraph: {
    title: "Muhammad Moiz ul haq // Unreal Engine Developer",
    description:
      "Unreal Engine / C++ Developer specializing in gameplay systems and multiplayer networking. Remote worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pressStart.variable} ${vt323.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
