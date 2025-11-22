import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SpinnerProps extends React.ComponentProps<"svg"> {
  message?: string;
}

function Spinner({ className, message, ...props }: SpinnerProps) {
  return (
    <div className="absolute flex items-center gap-1 justify-center w-full inset-0 z-1 bg-[#0a0a0a25]">
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
      {message || "Loading..."}
    </div>
  );
}

export { Spinner };
