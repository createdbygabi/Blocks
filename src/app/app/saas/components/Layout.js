export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="antialiased">{children}</div>
    </div>
  );
}
