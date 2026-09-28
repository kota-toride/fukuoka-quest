import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/game/store";
import { AssetProvider } from "@/lib/assets";
import { scanPublicMedia } from "@/lib/assets-server";
import { AppChrome } from "@/components/AppChrome";

// 和文フォントは next/font のセルフホストだと数百サブセットのDLが必要で不安定なため、
// Google Fonts を <link> で読み込む。オフライン時は globals.css のシステムフォントにフォールバック。
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,500&family=IBM+Plex+Mono:wght@400;500;600;700&family=Shippori+Mincho:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap";

export const metadata: Metadata = {
  title: "FUKUOKA QUEST — 福岡県を、現実世界のRPGに。",
  description: "福岡で起きていることを、AIがQUESTに変える。観光するのではなく、冒険する。",
};

export const viewport: Viewport = {
  themeColor: "#f2ead9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const media = scanPublicMedia();
  return (
    <html lang="ja" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body className="min-h-dvh">
        <AssetProvider files={media}>
          <GameProvider>
            <AppChrome>{children}</AppChrome>
          </GameProvider>
        </AssetProvider>
      </body>
    </html>
  );
}
