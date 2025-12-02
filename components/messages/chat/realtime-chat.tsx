"use client";

import { cn, showToast } from "@/lib/utils";
// import { ChatMessageItem } from '@/components/chat-message'
// import { useChatScroll } from '@/hooks/use-chat-scroll'
// import {
//   type ChatMessage,
//   useRealtimeChat,
// } from '@/hooks/use-realtime-chat'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Puzzle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatMessageItem } from "./chat-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setSelectedFriend } from "@/lib/slices/user-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabaseClient } from "@/utils/supabase/client";
import { MessageWithSender, Profile } from "@/types";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { useChatScroll } from "@/components/hooks/use-chat-scroll";

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = () => {
  const dispatch = useAppDispatch();
  const { selectedFriend } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.auth);
  const { containerRef, scrollToBottom } = useChatScroll();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const allMessages = useMemo(
    () =>
      messages.map((message) => ({
        id: message.id,
        created_at: message.created_at,
        user: message.sender_id as Profile,
        content: message.content,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, selectedFriend]
  );

  const getMessagesBySenderId = async () => {
    if (selectedFriend?.friend_id?.id) {
      const senderId = selectedFriend?.friend_id?.id;
      const { data, error } = await supabaseClient
        .from("messages")
        .select("*, sender_id(*), receiver_id(*)")
        .or(
          `and(sender_id.eq.${senderId},receiver_id.eq.${user?.id}),and(sender_id.eq.${user?.id},receiver_id.eq.${senderId})`
        )
        .order("created_at", { ascending: true });
      if (error) return showToast(error.message, "error");
      setMessages(data);
    }
  };

  useEffect(() => {
    getMessagesBySenderId();

    const setupRealtimeSubscription = async () => {
      const supabase = await supabaseClient;

      const channel = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          (payload) => {
            console.log("Messages change received", payload);
            getMessagesBySenderId();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    setupRealtimeSubscription();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFriend?.friend_id?.id]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      const { error } = await supabaseClient.from("messages").insert({
        content: newMessage.trim(),
        sender_id: user?.id,
        receiver_id: selectedFriend?.friend_id?.id,
      });
      if (error) throw error;
      showToast("Message sent successfully", "success");
      getMessagesBySenderId();
      // sendMessage(newMessage)
      setNewMessage("");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newMessage]
  );

  const handleBackToAll = useCallback(() => {
    dispatch(setSelectedFriend(null));
  }, [dispatch]);

  return (
    <div className="w-full px-4 ">
      <Button
        variant="outline"
        className="mb-3"
        onClick={handleBackToAll}
        type="button"
      >
        Back to all secret messages
      </Button>
      {/* Messages */}
      <Card className="flex-1 p-4 space-y-4">
        <CardHeader className="flex flex-row gap-4 items-center sm:justify-between px-2 pb-0 md:pb-5 md:pt-1 pt-0 border-b border-border">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-sm sm:text-base">
              Chat with {selectedFriend?.friend_id?.nickname}
            </CardTitle>
          </div>
          <Avatar className="mb-3 size-14 border-none bg-linear-to-br from-violet-100 to-fuchsia-100 shadow-inner shadow-white/70 sm:mb-0">
            <AvatarFallback className="bg-transparent text-violet-600">
              {selectedFriend?.friend_id?.nickname
                ?.split(" ")
                ?.map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent
          className="px-0 pb-0 overflow-y-auto h-[500px]"
          ref={containerRef}
        >
          {allMessages.length === 0 ? (
            <EmptyPlaceholder
              icon={Puzzle}
              title="No messages yet"
              className="h-full"
              description={`Start the conversation with ${selectedFriend?.friend_id?.nickname}!`}
            />
          ) : null}
          <div className="space-y-1">
            {allMessages.map((message, index) => {
              const prevMessage = index > 0 ? allMessages[index - 1] : null;
              const showHeader =
                !prevMessage ||
                prevMessage.user.nickname !== message.user.nickname;

              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    message={message}
                    isOwnMessage={
                      message.user.nickname ===
                      selectedFriend?.user_id?.nickname
                    }
                    showHeader={showHeader}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
        <form
          onSubmit={handleSendMessage}
          className="flex w-full gap-2 border-t border-border p-4"
        >
          <Input
            className={cn(
              "rounded-full bg-background text-sm transition-all duration-300"
              // isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
            )}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            // disabled={!isConnected}
          />
          {
            // isConnected &&
            newMessage.trim() && (
              <Button
                className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
                type="submit"
                // disabled={!isConnected}
              >
                <Send className="size-4" />
              </Button>
            )
          }
        </form>
      </Card>
    </div>
  );
};
