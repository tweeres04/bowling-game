import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { APP_BACKGROUND } from "./manifest";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto bowling",
  description: "An idle bowling game",
  // iOS ignores most of the manifest; this makes the home screen version
  // open full screen with its own name
  appleWebApp: {
    capable: true,
    title: "Auto bowling",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: APP_BACKGROUND,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
