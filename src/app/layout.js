import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";

const groteskFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-cal",
});

export const metadata = {
  title: "Blocks | A fully automated business that earns for you",
  description: "Create a fully automated business that earns for you",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${groteskFont.variable} ${displayFont.variable}`}
    >
      <body className={`antialiased scroll-smooth`}>{children}</body>
    </html>
  );
}
