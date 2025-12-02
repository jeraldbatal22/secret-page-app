import MessagesSkeleton from "@/components/messages/messages-skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full lg:max-w-lg">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-52 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-full flex-1">
        <MessagesSkeleton />
      </div>
    </div>
  );
}
