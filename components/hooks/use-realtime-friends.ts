import { useRealtimeSubscription } from "./use-realtime-subscription";

// hooks/useRealtimeFriends.ts
interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  // ... other fields as needed
}

interface UseRealtimeFriendsOptions {
  onFriendsChange?: () => void;
  userId?: string;
  enabled?: boolean;
}

/**
 * Realtime hook for friends table.
 * Calls onFriendsChange when any friend row is inserted, updated, or deleted.
 */
export function useRealtimeFriends({
  onFriendsChange,
  userId,
  enabled = true,
}: UseRealtimeFriendsOptions = {}) {
  return useRealtimeSubscription<Friend>({
    table: 'friends',
    event: '*',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onChange: () => {
      onFriendsChange?.();
    },
    channelName: `friends-${userId || 'all'}`,
    enabled,
  });
}
