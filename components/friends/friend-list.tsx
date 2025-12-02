"use client";

import { MessageCircle, Users } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseClient } from "@/utils/supabase/client";
import { setSelectedFriend, setUserFriends } from "@/lib/slices/user-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { EmptyPlaceholder } from "../ui/empty-placeholder";
import type { FriendWithProfiles, Profile } from "@/types";
import { useRealtimeFriends } from "../hooks/use-realtime-friends";
import { Button } from "../ui/button";

export function FriendList() {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const { friends = [], selectedFriend } = useAppSelector(
    (state) => state.user
  );
  const { user } = useAppSelector((state) => state.auth);

  const onHandleViewSelectUserFriend = (
    friend: FriendWithProfiles,
    selectedType: string
  ) => {
    dispatch(setSelectedFriend({ ...friend, type: selectedType as any }));
  };

  const canSelectFriend = path === "/secret-page-3";

  const fetchFriends = async () => {
    if (user?.id) {
      // Fetch friends for the authenticated user
      const { data: friends, error: friendsError } = await supabaseClient
        .from("friends")
        .select(`*, user_id(*), friend_id(*)`)
        .eq("user_id", user?.id);

      if (friendsError) throw friendsError;

      // Fetch your own user profile
      const { data: myProfile, error: myProfileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (myProfileError) throw myProfileError;

      // Add yourself as a friend entry with 0 messages
      const selfFriend: FriendWithProfiles = {
        user_id: myProfile as Profile,
        friend_id: myProfile as Profile,
        messagesCount: 0,
        latestMessage: null,
        isSelf: true,
      };

      // Type assertion for Supabase response with nested relations
      const typedFriends = (friends || []).map((friend) => ({
        ...friend,
        user_id: (Array.isArray(friend.user_id)
          ? friend.user_id[0]
          : friend.user_id) as Profile,
        friend_id: (Array.isArray(friend.friend_id)
          ? friend.friend_id[0]
          : friend.friend_id) as Profile,
      })) as FriendWithProfiles[];

      const mergeFriendsAndSelfFriend: FriendWithProfiles[] = [
        selfFriend,
        ...typedFriends,
      ];

      // Map over friends and fetch messages info
      const friendsWithMessages = await Promise.all(
        mergeFriendsAndSelfFriend.map(async (friend) => {
          const friendId =
            typeof friend.friend_id === "object" && "id" in friend.friend_id
              ? friend.friend_id.id
              : (friend.friend_id as string); // adjust depending on your schema

          // Get messages between current user and this friend
          const { data: messages, error: messagesError } = await supabaseClient
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${friendId})`)
            .is("receiver_id", null)
            .order("created_at", { ascending: false });

          if (messagesError) throw messagesError;

          return {
            ...friend,
            messagesCount: messages.length,
            latestMessage: messages[0] || null,
          };
        })
      );

      // dispatch(setUserFriends([selfFriend, ...friendsWithMessages]));
      dispatch(setUserFriends(friendsWithMessages));
    }
  };

  useRealtimeFriends({
    onFriendsChange: fetchFriends,
  });

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Card className="border-none bg-linear-to-b from-white to-violet-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-900">
          People you trust
        </CardTitle>
        <CardDescription>
          Tap someone to open your shared secret thread.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {friends.length === 0 ? (
          <EmptyPlaceholder
            icon={Users}
            title="No friends added yet"
            description="When you add friends, you can start trading secret messages."
            className="mx-auto w-full max-w-sm"
          />
        ) : (
          <div className="flex max-h-[900px] flex-col gap-3 overflow-y-auto pr-1">
            {friends.map((friend: FriendWithProfiles, index: number) => {
              return (
                <article
                  key={friend.id ?? index}
                  tabIndex={canSelectFriend ? 0 : -1}
                  className={cn(
                    "group flex items-center justify-between gap-4 rounded-3xl border bg-white/90 p-4 text-left shadow-[0_15px_45px_-35px_rgba(15,23,42,0.65)] transition-all duration-200",

                    friend?.friend_id?.id === selectedFriend?.friend_id?.id
                      ? "border-violet-200 bg-violet-50/70"
                      : "border-slate-100"
                  )}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <Avatar className="size-12 border border-slate-100 bg-linear-to-br from-violet-100 via-pink-50 to-orange-50">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback className="text-sm font-semibold text-violet-700">
                        {friend.isSelf
                          ? "Y"
                          : friend?.friend_id?.nickname
                              ?.split(" ")
                              .map((part: string) => part?.[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {friend.isSelf ? "You" : friend?.friend_id?.nickname}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {friend.latestMessage?.content ||
                          "No secrets shared yet. Start the conversation!"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      onClick={
                        canSelectFriend
                          ? () =>
                              onHandleViewSelectUserFriend(
                                friend,
                                "view-secret-message"
                              )
                          : undefined
                      }
                      className={cn(
                        canSelectFriend
                          ? "cursor-pointer hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)]"
                          : "cursor-default",
                        "border-violet-200 bg-violet-50/80 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                      )}
                    >
                      <MessageCircle className="mr-1 size-3.5" />
                      {friend.messagesCount ?? 0}{" "}
                      {(friend.messagesCount ?? 0) === 1 ? "secret" : "secrets"}
                    </Badge>
                    {user?.id !== friend?.friend_id?.id && (
                      <Button
                        variant="default"
                        className="text-[10px] hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)] h-7 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900 bg-violet-200 dark:bg-violet-900 font-semibold text-violet-900 dark:text-white"
                        onClick={() =>
                          onHandleViewSelectUserFriend(friend, "view-chat")
                        }
                        type="button"
                      >
                        Chat
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
