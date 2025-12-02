"use client";
import { Puzzle } from "lucide-react";
import { JSX, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { EmptyPlaceholder } from "../ui/empty-placeholder";
import MessagesSkeleton from "./messages-skeleton";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setMessages,
  setSelectedMessage,
} from "@/lib/slices/secret-message-silce";
import { setSelectedFriend } from "@/lib/slices/user-slice";
import { formatRelativeTime, showToast } from "@/lib/utils";
import { supabaseClient } from "@/utils/supabase/client";

import type { MessageWithSender } from "@/types";

type FriendshipStatus =
  | "none"
  | "friends"
  | "pending_sent"
  | "pending_received"
  | "self";

interface FriendshipInfo {
  type: "friend" | "request";
  status: string;
  isSender?: boolean;
}

const UsersSecretMessages = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { messages, selectedMessage } = useAppSelector(
    (state) => state.secretMessage
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const buildFriendshipMap = useCallback(
    (
      friendships: any[] | null,
      friendRequests: any[] | null,
      currentUserId: string
    ): Map<string, FriendshipInfo> => {
      const friendshipMap = new Map<string, FriendshipInfo>();

      friendships?.forEach((friendship) => {
        const otherId =
          friendship.user_id === currentUserId
            ? friendship.friend_id
            : friendship.user_id;
        friendshipMap.set(otherId, {
          type: "friend",
          status: friendship.status,
        });
      });

      friendRequests?.forEach((request) => {
        const otherId =
          request.sender_id === currentUserId
            ? request.receiver_id
            : request.sender_id;
        if (!friendshipMap.has(otherId)) {
          friendshipMap.set(otherId, {
            type: "request",
            status: request.status,
            isSender: request.sender_id === currentUserId,
          });
        }
      });

      return friendshipMap;
    },
    []
  );

  const determineFriendshipStatus = useCallback(
    (
      senderId: string,
      currentUserId: string,
      friendshipMap: Map<string, FriendshipInfo>
    ): FriendshipStatus => {
      if (senderId === currentUserId) return "self";

      const friendship = friendshipMap.get(senderId);
      if (!friendship) return "none";

      if (friendship.type === "friend") return "friends";
      if (friendship.type === "request") {
        return friendship.isSender ? "pending_sent" : "pending_received";
      }

      return "none";
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);

    try {
      const supabase = await supabaseClient;
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        showToast("Authentication required", "error");
        return;
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*, sender_id(*)")
        .is("receiver_id", null)
        .order("created_at", { ascending: false });

      if (messagesError) {
        throw new Error("Failed to load messages");
      }

      const senderIds = [
        ...new Set(
          messagesData
            ?.filter((msg) => msg.sender_id?.id !== currentUser.id)
            .map((msg) => msg.sender_id?.id)
            .filter(Boolean) || []
        ),
      ];

      if (senderIds.length === 0) {
        dispatch(setMessages(messagesData || []));
        return;
      }

      const orQuery = `and(user_id.eq.${
        currentUser.id
      },friend_id.in.(${senderIds.join(",")})),and(friend_id.eq.${
        currentUser.id
      },user_id.in.(${senderIds.join(",")}))`;

      const [{ data: friendships }, { data: friendRequests }] =
        await Promise.all([
          supabase
            .from("friends")
            .select("user_id, friend_id, status")
            .or(orQuery),
          supabase
            .from("friend_requests")
            .select("sender_id, receiver_id, status")
            .or(
              orQuery
                .replace(/user_id/g, "sender_id")
                .replace(/friend_id/g, "receiver_id")
            ),
        ]);

      const friendshipMap = buildFriendshipMap(
        friendships,
        friendRequests,
        currentUser.id
      );

      const messagesWithFriendship = messagesData?.map((msg) => ({
        ...msg,
        friendship_status: determineFriendshipStatus(
          msg.sender_id?.id,
          currentUser.id,
          friendshipMap
        ),
      }));

      dispatch(setMessages(messagesWithFriendship ?? []));
    } catch (error) {
      console.error("[fetchMessages]", error);
      showToast("Failed to load messages. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, buildFriendshipMap, determineFriendshipStatus]);

  const handleAcceptFriendRequest = useCallback(
    async (senderId: string) => {
      if (!user?.id) return;

      try {
        const supabase = await supabaseClient;

        const { data: request, error: fetchError } = await supabase
          .from("friend_requests")
          .select("*")
          .eq("sender_id", senderId)
          .eq("receiver_id", user.id)
          .single();

        if (fetchError || !request) {
          showToast("Friend request not found", "error");
          return;
        }

        if (request.status === "accepted") {
          showToast("Friend request already accepted", "error");
          return;
        }

        const { error: updateError } = await supabase
          .from("friend_requests")
          .update({ status: "accepted" })
          .eq("receiver_id", user.id)
          .eq("sender_id", senderId);

        if (updateError) throw updateError;

        const { error: friendError } = await supabase.from("friends").insert([
          { user_id: request.sender_id, friend_id: request.receiver_id },
          { user_id: request.receiver_id, friend_id: request.sender_id },
        ]);

        if (friendError) throw friendError;

        showToast("Friend request accepted", "success");
        fetchMessages();
      } catch (error) {
        console.error("[handleAcceptFriendRequest]", error);
        showToast("Failed to accept friend request", "error");
      }
    },
    [user?.id, fetchMessages]
  );

  const handleAddAsFriend = useCallback(
    async (senderId: string) => {
      if (!user?.id) return;

      try {
        const supabase = await supabaseClient;

        const { data: existingRequests, error: existingError } = await supabase
          .from("friend_requests")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${senderId})`)
          .in("status", ["pending"]);

        if (existingError) throw existingError;

        if (existingRequests?.some((r) => r.status === "pending")) {
          showToast("Already Pending Friend Request", "error");
          return;
        }

        const { error } = await supabase
          .from("friend_requests")
          .insert([
            {
              sender_id: user.id,
              receiver_id: senderId,
              status: "pending",
            },
          ])
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            showToast("Already Pending Friend Request", "error");
          } else {
            throw error;
          }
        } else {
          showToast("Friend request sent successfully", "success");
          fetchMessages();
        }
      } catch (error) {
        console.error("[handleAddAsFriend]", error);
        showToast("Failed to send friend request", "error");
      }
    },
    [user?.id, fetchMessages]
  );

  const handleViewUserProfile = useCallback(
    (message: MessageWithSender) => {
      if (pathname !== "/secret-page-3") return;

      const restrictedStatuses: FriendshipStatus[] = [
        "none",
        "pending_received",
        "pending_sent",
      ];

      if (
        restrictedStatuses.includes(
          message.friendship_status as FriendshipStatus
        )
      ) {
        showToast("", "error", {
          title: "401",
          description:
            "You must be friends with this user to view their secret messages.",
        });
      } else {
        dispatch(
          setSelectedFriend({
            friend_id: message.sender_id,
            type: "view-secret-message",
          } as any)
        );
      }
    },
    [pathname, dispatch]
  );

  const handleEditMessage = useCallback(
    (message: MessageWithSender) => {
      dispatch(setSelectedMessage(message));
    },
    [dispatch]
  );

  const renderFriendStatusButton = useCallback(
    (message: MessageWithSender) => {
      const buttonClass =
        "text-[10px] sm:text-[10px] h-7 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900 bg-violet-200 dark:bg-violet-900 font-semibold text-violet-900 dark:text-white whitespace-nowrap";

      const statusButtons: Record<FriendshipStatus, JSX.Element | null> = {
        none: (
          <Button
            size="sm"
            onClick={() => handleAddAsFriend(message.sender_id?.id)}
            className={buttonClass}
          >
            <span className="">Add Friend</span>
          </Button>
        ),
        friends: (
          <Button size="sm" className={buttonClass}>
            <span className="">✓ Friends</span>
          </Button>
        ),
        pending_sent: (
          <Button size="sm" className={buttonClass}>
            <span className="">Pending Request</span>
          </Button>
        ),
        pending_received: (
          <Button
            size="sm"
            onClick={() => handleAcceptFriendRequest(message.sender_id?.id)}
            className={buttonClass}
          >
            <span className="">Accept Request</span>
          </Button>
        ),
        self: null,
      };

      return (
        statusButtons[message.friendship_status as FriendshipStatus] || null
      );
    },
    [handleAddAsFriend, handleAcceptFriendRequest]
  );

  useEffect(() => {
    fetchMessages();

    const setupRealtimeSubscription = async () => {
      const supabase = await supabaseClient;

      const channel = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          (payload) => {
            console.log("Messages change received", payload);
            fetchMessages();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "friend_requests" },
          (payload) => {
            console.log("Friend requests change received", payload);
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    setupRealtimeSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  const isEditingCurrentMessage = (messageId: string) =>
    selectedMessage?.id === messageId;
  const canEditMessage = (message: MessageWithSender) =>
    pathname === "/secret-page-2" && message.sender_id?.id === user?.id;

  return (
    <section className="w-full  py-4 sm:px-4 sm:py-6">
      <Card className="mx-auto w-full max-w-6xl bg-white">
        <CardHeader className="flex flex-row  gap-3 space-y-0 sm:items-center sm:justify-between sm:gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">
              Secret Messages
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Say hello to everyone hanging out here.
            </p>
          </div>
          <Avatar className="mb-0 size-12 sm:size-14 border-none bg-linear-to-br from-violet-100 to-fuchsia-100 shadow-inner shadow-white/70 sm:mb-0">
            <AvatarFallback className="bg-transparent text-violet-600">
              <Puzzle className="size-5 sm:size-6" strokeWidth={1.8} />
            </AvatarFallback>
          </Avatar>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          <div className="mt-5 flex max-h-[calc(100vh-380px)] sm:max-h-[900px] flex-col gap-3 sm:gap-4 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <EmptyPlaceholder
                icon={Puzzle}
                title="No secret messages yet"
                description="Once someone shares a secret, it will appear here. Be the first to drop one!"
              />
            ) : (
              messages.map((message: MessageWithSender) => (
                <article
                  key={message.id}
                  className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white/90 p-3 sm:p-5 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)]"
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:flex-nowrap sm:items-center">
                    <div className="flex w-full items-center gap-2 sm:gap-3 sm:w-auto">
                      <Avatar className="size-10 sm:size-12 border border-slate-100 bg-linear-to-br from-violet-100 via-pink-50 to-orange-50 shrink-0">
                        <AvatarFallback className="text-xs sm:text-sm font-semibold text-violet-700">
                          {message.sender_id?.nickname
                            ?.split(" ")
                            ?.map((part: string) => part[0])
                            ?.join("")
                            ?.slice(0, 2)
                            ?.toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {message.sender_id?.id === user?.id
                            ? "You"
                            : message.sender_id?.nickname}
                        </p>
                        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-violet-600">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:gap-3">
                      {renderFriendStatusButton(message)}
                      {pathname === "/secret-page-3" && (
                        <Button
                          size="sm"
                          onClick={() => handleViewUserProfile(message)}
                          className="h-7 flex-1 sm:flex-initial cursor-pointer bg-violet-200 text-[10px] font-semibold text-violet-900 hover:bg-violet-100 dark:bg-violet-900 dark:text-white dark:hover:bg-violet-900"
                        >
                          <span className="">View Secret Messages</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="my-3 sm:my-4 text-sm sm:text-base leading-relaxed text-slate-700 wrap-break-word">
                    {message.content}
                  </p>

                  {message.image_url && (
                    <div className="relative w-full overflow-hidden rounded-lg">
                      <Image
                        src={message.image_url}
                        alt={`Message attachment for ${message.id}`}
                        height={400}
                        width={600}
                        className="h-auto w-full object-cover rounded-lg"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                      />
                    </div>
                  )}

                  {canEditMessage(message) && (
                    <div className="mt-3 flex items-center justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 sm:h-8 px-2 sm:px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                        onClick={() => handleEditMessage(message)}
                      >
                        {isEditingCurrentMessage(message.id)
                          ? "Editing…"
                          : "Edit"}
                      </Button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default UsersSecretMessages;
