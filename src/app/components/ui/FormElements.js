export function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-white tracking-wide">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 placeholder:text-gray-500"
      />
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200 min-h-[120px] placeholder:text-gray-600"
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className="w-full appearance-none bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-200"
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-white text-black",
    secondary: "bg-gray-900 text-gray-300 border border-gray-800",
    white: "bg-white text-black",
  };

  return (
    <button
      {...props}
      className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-gray-950 border border-gray-800/80 rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}
