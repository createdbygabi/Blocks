export function QuickActionCard({ title, description, icon, action, badge }) {
  return (
    <button
      onClick={() => (window.location.href = action)}
      className="w-full text-left p-6 bg-[#0C0F17] rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{title}</h3>
            {badge && (
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3">{description}</p>
          <span className="text-sm text-blue-400 group-hover:text-blue-300">
            Set up now →
          </span>
        </div>
      </div>
    </button>
  );
}
