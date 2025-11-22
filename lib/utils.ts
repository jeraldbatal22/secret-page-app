import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(
  date: Date | string,
  format: "years" | "days" | "hours" | "default" = "default"
) {
  // Note: If you want to use a library like moment.js, import it first. Here, we'll use native JS.
  const now = new Date();
  const givenDate = new Date(date);
  const diff = now.getTime() - givenDate.getTime();

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerYear = msPerDay * 365;

  switch (format) {
    case "years": {
      const years = Math.floor(diff / msPerYear);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    }
    case "days": {
      const days = Math.floor(diff / msPerDay);
      return days === 1 ? "1 day ago" : `${days} days ago`;
    }
    case "hours": {
      const hours = Math.floor(diff / msPerHour);
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    default: {
      if (diff < msPerMinute) {
        return "just now";
      } else if (diff < msPerHour) {
        const mins = Math.floor(diff / msPerMinute);
        return mins === 1 ? "1 minute ago" : `${mins} minutes ago`;
      } else if (diff < msPerDay) {
        const hrs = Math.floor(diff / msPerHour);
        return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
      } else if (diff < msPerYear) {
        const days = Math.floor(diff / msPerDay);
        return days === 1 ? "1 day ago" : `${days} days ago`;
      } else {
        const years = Math.floor(diff / msPerYear);
        return years === 1 ? "1 year ago" : `${years} years ago`;
      }
    }
  }
}

import type { ToastOptions } from "@/types";

export const showToast = (
  message: string,
  type: "success" | "error",
  options?: ToastOptions
) => {
  toast[type](message, {
    richColors: true,
    position: "top-center",
    ...options,
  });
};
