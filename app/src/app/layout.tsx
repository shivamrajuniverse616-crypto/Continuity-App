import type { Metadata } from "next";
import { Inter, Patrick_Hand, Caveat } from "next/font/google"; // Import fonts
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand"
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat"
});

export const metadata: Metadata = {
  title: "Continuity",
  description: "Seamlessly organize your life with AI-driven continuity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${patrickHand.variable} ${caveat.variable} font-sans antialiased text-gray-800 selection:bg-rose selection:text-white`}
      >
        <div className="fixed inset-0 -z-10 opacity-80 pointer-events-none mix-blend-overlay"></div>
        {children}
      </body>
    </html>
  );
}
