export default function SaasLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="w-full m-0 p-0 bg-black text-white">{children}</body>
    </html>
  );
}
