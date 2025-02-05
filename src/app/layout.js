import "./globals.css";
import { TabNavigation } from "./components/TabNavigation";
import { ClientWrapper } from "./components/ClientWrapper";
import {
  inter,
  plusJakarta,
  dmSans,
  spaceGrotesk,
  crimsonPro,
  workSans,
} from "./fonts";

// Debug print for font loading in layout
console.log("Loading fonts in root layout:", {
  inter: inter.variable,
  plusJakarta: plusJakarta.variable,
  dmSans: dmSans.variable,
  spaceGrotesk: spaceGrotesk.variable,
  crimsonPro: crimsonPro.variable,
  workSans: workSans.variable,
});

const fontVariables = `${inter.variable} ${plusJakarta.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${workSans.variable}`;

export const metadata = {
  title: "Blocks - Build with AI",
  description: "Create a fully automated business that earns for you using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <TabNavigation />
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
