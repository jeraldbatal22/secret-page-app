import { useRealtimeSubscription } from "./use-realtime-subscription";

// hooks/useRealtimeMessages.ts
interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  // ... other fields
}

interface UseRealtimeMessagesOptions {
  onMessagesChange?: () => void;
  userId?: string;
  enabled?: boolean;
}

export function useRealtimeMessages({
  onMessagesChange,
  userId,
  enabled = true,
}: UseRealtimeMessagesOptions = {}) {
  return useRealtimeSubscription<Message>({
    table: 'messages',
    event: '*',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onChange: () => {
      onMessagesChange?.();
    },
    channelName: `messages-${userId || 'all'}`,
    enabled,
  });
}
