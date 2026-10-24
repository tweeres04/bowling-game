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

const DESCRIPTION =
  "You start out rolling gutter balls and bowling 70s. Pick what to practice, let it auto bowl, and it keeps improving while you're away.";

export const metadata: Metadata = {
  // Share previews need the share image as a full URL
  metadataBase: new URL("https://idle-bowling.tweeres.com"),
  title: "Idle bowling",
  description: DESCRIPTION,
  openGraph: {
    title: "Idle bowling",
    description: DESCRIPTION,
    url: "/",
    siteName: "Idle bowling",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Idle bowling",
    description: DESCRIPTION,
  },
  // iOS ignores most of the manifest; this makes the home screen version
  // open full screen with its own name
  appleWebApp: {
    capable: true,
    title: "Idle bowling",
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
