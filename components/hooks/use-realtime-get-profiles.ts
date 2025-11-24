import { useRealtimeSubscription } from "./use-realtime-subscription";

// hooks/useRealtimeGetProfiles.ts
interface Profile {
  id: string;
  nickname: string;
  avatar_url?: string;
  created_at: string;
  // ... other fields
}

interface UseRealtimeGetProfilesOptions {
  onProfilesChange?: () => void;
  profileId?: string;
  enabled?: boolean;
}

/**
 * Realtime hook for profiles table.
 * Calls onProfilesChange when any profile row is inserted, updated, or deleted.
 */
export function useRealtimeGetProfiles({
  onProfilesChange,
  profileId,
  enabled = true,
}: UseRealtimeGetProfilesOptions = {}) {
  return useRealtimeSubscription<Profile>({
    table: 'profiles',
    event: '*',
    filter: profileId ? `id=eq.${profileId}` : undefined,
    onChange: () => {
      onProfilesChange?.();
    },
    channelName: `profiles-${profileId || 'all'}`,
    enabled,
  });
}
