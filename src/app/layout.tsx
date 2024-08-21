import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'TecHBK-Tetris',
    template: '%s | TecHBK-Tetris',
  },
  description: 'Try and beat the highest score and be the best TecHBK-Tetris player!',
  openGraph: {
    title: {
      default: 'TecHBK-Tetris',
      template: '%s | TecHBK-Tetris',
    },
    description: 'Try and beat the highest score and be the best TecHBK-Tetris player!',
    images: [
      {
        url: '/default-og-image.png',
        width: 1200,
        height: 630,
        alt: 'TecHBK-Tetris',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
