import type { Metadata, Viewport } from "next";
import { Pirata_One, Inter_Tight } from "next/font/google";
import "./globals.css";

const display = Pirata_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onepiecedle — Daily One Piece Character Guessing Game",
  description:
    "A daily character-guessing game for fans of One Piece. Six modes, new puzzles every day.",
  applicationName: "Onepiecedle",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t-2 border-border mt-8 py-6 px-4 text-center text-[11px] text-muted">
          <p className="max-w-2xl mx-auto">
            Onepiecedle is an unofficial fan project and is not affiliated with, endorsed by, or
            sponsored by Eiichiro Oda, Shueisha, Toei Animation, or any official One Piece rights
            holder. All character names, likenesses, and references are the property of their
            respective owners and are used here under fair-use principles for transformative fan
            commentary. No monetization.
          </p>
        </footer>
      </body>
    </html>
  );
}
