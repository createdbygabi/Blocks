import { crimsonPro } from "../fonts";

export const metadata = {
  title: "Blocks - Build with AI",
  description: "Create a fully automated business that earns for you using AI",
};

export default function LoginLayout({ children }) {
  return (
    <div className={`min-h-screen bg-black ${crimsonPro.className}`}>
      {children}
    </div>
  );
}
