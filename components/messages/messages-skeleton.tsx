// components/messages/messages-skeleton.tsx
export default function MessagesSkeleton() {
  return (
    <div className="space-y-4 px-4 py-7">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex flex-col flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
