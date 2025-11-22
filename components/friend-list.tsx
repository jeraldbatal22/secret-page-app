"use client";

import { Handshake, MessageCircle, Users } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  setSelectedFriend,
  setUserFriendRequests,
  setUserFriends,
} from "@/lib/slices/user-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { cn, showToast } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { EmptyPlaceholder } from "./ui/empty-placeholder";
import { supabaseClient } from "@/utils/supabase/client";
import type { FriendWithProfiles, FriendRequestWithSender, Profile } from "@/types";

export function FriendList() {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const {
    friends = [],
    selectedFriend,
    friendRequests,
  } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.auth);

  const onHandleSelectUserFriend = (friend: FriendWithProfiles) => {
    dispatch(setSelectedFriend(friend));
  };

  const canSelectFriend = path === "/secret-page-3";

  const fetchFriends = async () => {
    if (user?.id) {
      // Fetch friends for the authenticated user
      const { data: friends, error: friendsError } = await supabaseClient()
        .from("friends")
        .select(`user_id(*), friend_id(*)`)
        .eq("user_id", user?.id);

      if (friendsError) throw friendsError;

      // Fetch your own user profile
      const { data: myProfile, error: myProfileError } = await supabaseClient()
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
        user_id: (Array.isArray(friend.user_id) ? friend.user_id[0] : friend.user_id) as Profile,
        friend_id: (Array.isArray(friend.friend_id) ? friend.friend_id[0] : friend.friend_id) as Profile,
      })) as FriendWithProfiles[];

      const mergeFriendsAndSelfFriend: FriendWithProfiles[] = [selfFriend, ...typedFriends];

      // Map over friends and fetch messages info
      const friendsWithMessages = await Promise.all(
        mergeFriendsAndSelfFriend.map(async (friend) => {
          const friendId = typeof friend.friend_id === "object" && "id" in friend.friend_id 
            ? friend.friend_id.id 
            : (friend.friend_id as string); // adjust depending on your schema

          // Get messages between current user and this friend
          const { data: messages, error: messagesError } =
            await supabaseClient()
              .from("messages")
              .select("*")
              .or(`and(sender_id.eq.${friendId})`)
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

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchFriendRequests = async () => {
    if (user?.id) {
      const { data, error } = await supabaseClient()
        .from("friend_requests")
        .select(`*, sender_id(*)`)
        .eq("receiver_id", user?.id)
        .eq("status", "pending");
      if (error) {
        console.error(error);
      } else {
        dispatch(setUserFriendRequests(data));
      }
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAcceptFriendRequest = async (profile: FriendRequestWithSender) => {
    // 1️⃣ Get the friend request first
    const { data: request, error: fetchError } = await supabaseClient()
      .from("friend_requests")
      .select("*")
      .eq("id", profile.id)
      .single();

    if (fetchError) showToast(fetchError.message, "error");
    if (!request) showToast("Friend request not found", "error");

    const { sender_id, receiver_id, status } = request;

    if (status === "accepted") {
      return showToast("Friend request already accepted", "error");
    }

    // 2️⃣ Update friend request to accepted
    const { error: updateError } = await supabaseClient()
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", profile.id);

    if (updateError) showToast(updateError.message, "error");

    // 3️⃣ Add friendship in friends table (both directions)
    // Optionally, you can only store one row if you enforce bidirectional uniqueness
    const { error: friendError } = await supabaseClient()
      .from("friends")
      .insert([
        { user_id: sender_id, friend_id: receiver_id },
        { user_id: receiver_id, friend_id: sender_id }, // optional, if you want both directions
      ]);

    if (friendError) showToast(friendError.message, "error");

    return showToast("Friend request accepted", "success");
  };
  // const handleDeclineFriendRequest = (profile: FriendRequestWithSender) => {};
  return (
    <div className="flex w-full max-w-full flex-col gap-6 lg:max-w-md">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-inner">
          <TabsTrigger
            value="friends"
            className="flex items-center justify-center gap-2 rounded-xl"
          >
            <Users className="size-4 text-slate-600" />
            <span className="text-sm font-semibold">Friends</span>
            <span className="rounded-full bg-slate-900/5 px-1.5 text-xs font-semibold text-slate-600">
              {friends.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex items-center justify-center gap-2 rounded-xl"
          >
            <Handshake className="size-4 text-slate-600" />
            <span className="text-sm font-semibold">Requests</span>
            <span className="rounded-full bg-slate-900/5 px-1.5 text-xs font-semibold text-slate-600">
              {friendRequests.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
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
                        role="button"
                        tabIndex={canSelectFriend ? 0 : -1}
                        onClick={
                          canSelectFriend
                            ? () => onHandleSelectUserFriend(friend)
                            : undefined
                        }
                        className={cn(
                          "group flex items-center justify-between gap-4 rounded-3xl border bg-white/90 p-4 text-left shadow-[0_15px_45px_-35px_rgba(15,23,42,0.65)] transition-all duration-200",
                          canSelectFriend
                            ? "cursor-pointer hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)]"
                            : "cursor-default",
                          friend?.friend_id?.id ===
                            selectedFriend?.friend_id?.id
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
                              {friend.isSelf
                                ? "You"
                                : friend?.friend_id?.nickname}
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
                            className="border-violet-200 bg-violet-50/80 text-xs font-semibold text-violet-700"
                          >
                            <MessageCircle className="mr-1 size-3.5" />
                            {friend.messagesCount ?? 0}{" "}
                            {(friend.messagesCount ?? 0) === 1 ? "secret" : "secrets"}
                          </Badge>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card className="border-none bg-linear-to-b from-white to-rose-50/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">
                Incoming Friend Requests
              </CardTitle>
              <CardDescription>
                Approve people before letting them peek at your secrets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {friendRequests.length === 0 ? (
                <EmptyPlaceholder
                  icon={Handshake}
                  title="No pending requests"
                  description="Friend requests will show up here for you to accept or reject."
                  className="mx-auto w-full max-w-sm"
                />
              ) : (
                <div className="flex max-h-[900px] flex-col gap-3 overflow-y-auto pr-1">
                  {friendRequests.map((friend: FriendRequestWithSender, index: number) => (
                    <article
                      key={friend.id ?? index}
                      className="rounded-3xl border border-rose-100 bg-white/90 p-4 shadow-[0_15px_45px_-35px_rgba(190,24,93,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200/70 hover:shadow-[0_18px_55px_-35px_rgba(190,24,93,0.5)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12 border border-rose-50 bg-linear-to-br from-rose-50 via-orange-50 to-amber-50">
                            <AvatarImage src={typeof friend.sender_id === "object" && "avatar_url" in friend.sender_id ? friend.sender_id.avatar_url : undefined} />
                            <AvatarFallback className="text-sm font-semibold text-rose-600">
                              {friend?.sender_id?.nickname
                                ?.split(" ")
                                .map((part: string) => part?.[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {friend?.sender_id?.nickname}
                            </p>
                            <p className="text-xs text-slate-500">
                              Wants to be friend with you.
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                          <Button
                            onClick={() => handleAcceptFriendRequest(friend)}
                            className="w-full rounded-2xl bg-linear-to-r from-violet-500 to-indigo-500 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-600 sm:w-auto"
                            variant="secondary"
                          >
                            Accept
                          </Button>
                          {/* <Button
                            onClick={() => handleDeclineFriendRequest(friend)}
                            className="w-full rounded-2xl sm:w-auto"
                            variant="destructive"
                          >
                            Reject
                          </Button> */}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
