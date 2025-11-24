import { useRealtimeSubscription } from "./use-realtime-subscription";

// hooks/useRealtimeFriendRequests.ts
interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  // ... other fields as needed
}

interface UseRealtimeFriendRequestsOptions {
  onFriendRequestsChange?: () => void;
  userId?: string; // typically the receiver
  enabled?: boolean;
}

/**
 * Realtime hook for friend_requests table.
 * Calls onFriendRequestsChange when any friend_request row is inserted, updated, or deleted.
 */
export function useRealtimeFriendRequests({
  onFriendRequestsChange,
  userId,
  enabled = true,
}: UseRealtimeFriendRequestsOptions = {}) {
  return useRealtimeSubscription<FriendRequest>({
    table: 'friend_requests',
    event: '*',
    // watches as receiver (user) for new or updated requests
    filter: userId ? `receiver_id=eq.${userId}` : undefined,
    onChange: () => {
      onFriendRequestsChange?.();
    },
    channelName: `friend-requests-${userId || 'all'}`,
    enabled,
  });
}
