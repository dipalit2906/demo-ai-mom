// Reusable shimmer skeleton loader
// Usage: <LoadingSkeleton lines={5} /> or <LoadingSkeleton type="card" />

export default function LoadingSkeleton({ lines = 4, type = 'list' }) {
  if (type === 'card') {
    return (
      <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-card">
        <div className="h-5 bg-rose-100 dark:bg-gray-700 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-4/6" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-3/4" />
      </div>
    )
  }

  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-rose-100 dark:bg-gray-700 rounded-full"
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  )
}
