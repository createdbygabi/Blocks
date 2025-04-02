import { headers } from "next/headers";
import Navbar from "../components/Navbar";

export default function ToolsLayout({ children }) {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");

  return (
    <div className="min-h-screen bg-white">
      <Navbar subdomain={subdomain} />
      <main>{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} {subdomain}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
