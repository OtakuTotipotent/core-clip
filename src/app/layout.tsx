import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoreClip.ai",
  description: "Create product visuals and short-form videos with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#db2777", // pink-600
          colorBackground: "#0a0a0a", // deep black matching your theme
          colorForeground: "#f3f4f6", // gray-100
          colorMutedForeground: "#9ca3af", // gray-400
          borderRadius: "0.75rem",
        },
        elements: {
          card: "border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl",
          alternativeMethodsBlockButton:
            "border border-white/10 hover:bg-white/5 transition-all text-white",
          formButtonPrimary:
            "bg-pink-600 hover:bg-pink-700 text-white transition-all rounded-full",
          userButtonPopoverCard:
            "border border-white/10 bg-[#0a0a0a] backdrop-blur-md",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} font-sans h-full antialiased scroll-smooth`}
        data-scroll-behavior="smooth"
      >
        <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
