export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-8 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
        <div className="h-3 w-4/6 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded mt-4" />
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-7 w-3/4 bg-gray-200 rounded mb-6" />
      <div className="space-y-3 mb-6">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-4/6 bg-gray-200 rounded" />
      </div>
      <div className="h-20 w-full bg-gray-200 rounded mb-4" />
      <div className="h-20 w-full bg-gray-200 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-gray-200 rounded" />
        <div className="h-5 w-14 bg-gray-200 rounded" />
        <div className="h-5 w-14 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
