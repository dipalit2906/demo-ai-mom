// QuickChips — preset filter buttons that modify meal generation
// Props:
//   activePreset: string | null — the currently selected preset
//   onSelect: function(presetId | null) — called when a chip is clicked

const presets = [
  { id: 'quick', label: '⚡ Quick Meals', description: 'Under 15 mins' },
  { id: 'school_lunch', label: '🎒 School Lunch', description: 'Kid-friendly' },
  { id: 'healthy', label: '🥦 Healthy Week', description: 'Balanced nutrition' },
  { id: 'budget', label: '💰 Budget Meals', description: 'Wallet-friendly' },
]

export default function QuickChips({ activePreset, onSelect }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Quick Presets
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id
          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => onSelect(isActive ? null : preset.id)}
              className={`group flex flex-col items-start px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-rose-500 border-rose-500 text-white shadow-soft'
                  : 'bg-white dark:bg-gray-800 border-rose-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-card'
                }`}
            >
              <span>{preset.label}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-rose-100' : 'text-gray-400 dark:text-gray-500'}`}>
                {preset.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
