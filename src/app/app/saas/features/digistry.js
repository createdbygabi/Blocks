"use client";

export default function DigestryFeature({ styles }) {
  return (
    <div className={`rounded-lg ${styles.card || "bg-gray-800"} p-6 mt-6`}>
      <h3
        className={`text-lg font-semibold mb-4 ${
          styles.text?.primary || "text-white"
        }`}
      >
        Digistry Custom Feature
      </h3>
      {/* Custom feature implementation */}
    </div>
  );
}
