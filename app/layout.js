import "./globals.css";
import { Outfit } from "next/font/google"

export const metadata = {
  title: "Core-Clip | Homepage",
  description: "An AI oriented content generation platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="{Outfit}"
      >
        {children}
      </body>
    </html>
  );
}
