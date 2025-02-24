"use client";

export default function CompletePage() {
  // Close window and notify parent when this page loads
  if (typeof window !== "undefined") {
    window.opener?.postMessage("stripe_complete", "*");
    window.close();
  }

  return <div>Setup complete. This window will close automatically.</div>;
}
