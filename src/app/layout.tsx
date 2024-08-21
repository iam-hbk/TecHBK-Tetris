import type { Metadata } from "next";
import { Urbanist as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, MessageSquare } from "lucide-react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: {
    default: "TecHBK-Tetris",
    template: "%s | TecHBK-Tetris",
  },
  description:
    "Try and beat the highest score and be the best TecHBK-Tetris player!",
  openGraph: {
    title: {
      default: "TecHBK-Tetris",
      template: "%s | TecHBK-Tetris",
    },
    description:
      "Try and beat the highest score and be the best TecHBK-Tetris player!",
    images: [
      {
        url: "/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "TecHBK-Tetris",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background px-3 font-sans antialiased bg-gradient-to-b relative from-blue-600 via-purple-400 to-orange-400",
          fontSans.variable
        )}
      >
        <nav className="p-2 flex flex-row justify-between sticky top-1 backdrop-blur-xl border rounded-md">
          <Link href="#">
            <Button variant={"ghost"} size={"sm"}>
              <Menu className="mr-4 h-4 w-4" /> Leaderbord (Coming Soon)
            </Button>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-100 animate-pulse">
            TecHBK - Tetris
          </h1>
          <Link target="_blank" href="https://wa.me/+27642448112">
            <Button variant={"ghost"} size={"sm"}>
              <MessageSquare className="mr-4 h-4 w-4" /> Tell me what you think
            </Button>
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
