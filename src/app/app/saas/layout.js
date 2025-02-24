import "../globals.css"; // Still need global styles

export default function SaasLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen m-0 p-0 bg-black text-white">
        {children}
      </body>
    </html>
  );
}
