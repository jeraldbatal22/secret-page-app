// hooks/useRealtimeSubscription.ts
import { useEffect, useRef } from "react";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useAppSelector } from "@/lib/hooks";
import { supabaseClient } from "@/utils/supabase/client";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface RealtimeSubscriptionOptions<T extends { [key: string]: any } = any> {
  table: string;
  schema?: string;
  event?: RealtimeEvent;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  channelName?: string;
  enabled?: boolean;
}

/**
 * Generic hook for subscribing to Supabase real-time changes
 * Handles subscription lifecycle and cleanup automatically
 */
export function useRealtimeSubscription<
  T extends { [key: string]: any } = any
>({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  channelName,
  enabled = true,
}: RealtimeSubscriptionOptions<T>) {
  const { user } = useAppSelector((state) => state.auth);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onChange });

  // Keep callbacks up to date without triggering re-subscriptions
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete, onChange };
  }, [onInsert, onUpdate, onDelete, onChange]);

  useEffect(() => {
    if (!enabled) return;
  
    const channel = supabaseClient.channel(
      channelName || `realtime-${table}-${Date.now()}`
    );
  
    channel
      .on(
        "postgres_changes" as any,
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const { eventType } = payload;
  
          if (eventType === "INSERT" && callbacksRef.current.onInsert) {
            callbacksRef.current.onInsert(payload);
          } else if (eventType === "UPDATE" && callbacksRef.current.onUpdate) {
            callbacksRef.current.onUpdate(payload);
          } else if (eventType === "DELETE" && callbacksRef.current.onDelete) {
            callbacksRef.current.onDelete(payload);
          }
  
          if (callbacksRef.current.onChange) {
            callbacksRef.current.onChange(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscribed to ${table}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ Error subscribing to ${table}`);
        }
      });
  
    channelRef.current = channel;
    return () => {
      console.log(`🔌 Unsubscribing from ${table}`);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [table, schema, event, filter, channelName, enabled, user?.id]);

  return channelRef;
}
