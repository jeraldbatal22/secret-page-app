"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MailQuestion } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { EmptyPlaceholder } from "../ui/empty-placeholder";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSelectedMessage } from "@/lib/slices/secret-message-silce";
import {
  setSelectedFriend,
  setUserSecretMessages,
} from "@/lib/slices/user-slice";
import { supabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import type { Message } from "@/types";

const UserSecretMessages = () => {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const { selectedMessage } = useAppSelector((state) => state.secretMessage);
  const { selectedFriend, userSecretMessages } = useAppSelector(
    (state) => state.user
  );
  const [isLoadingSecretMessages, setIsLoadingSecretMessages] = useState(true);

  const friendId = selectedFriend?.friend_id?.id;
  const friendAvatarUrl =
    typeof selectedFriend?.friend_id === "object" &&
    "avatar_url" in selectedFriend.friend_id
      ? selectedFriend.friend_id.avatar_url
      : undefined;

  const friendTitle = useMemo(() => {
    if (selectedFriend?.id === "you") return "Your";
    if (
      typeof selectedFriend?.friend_id === "object" &&
      "nickname" in selectedFriend.friend_id
    ) {
      return selectedFriend.friend_id.nickname;
    }
    return "Friend";
  }, [selectedFriend]);

  const fetchUserSecretMessagesByUserId = useCallback(async () => {
    if (!selectedFriend) {
      dispatch(setUserSecretMessages([]));
      setIsLoadingSecretMessages(false);
      return;
    }
    setIsLoadingSecretMessages(true);
    try {
      const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("sender_id", friendId)
        .is("receiver_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      dispatch(setUserSecretMessages(data ?? []));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch your secret messages.";
      toast.error(errorMessage, {
        richColors: true,
        position: "top-center",
      });
      dispatch(setUserSecretMessages([]));
    } finally {
      setIsLoadingSecretMessages(false);
    }
  }, [dispatch, friendId, selectedFriend]);

  useEffect(() => {
    fetchUserSecretMessagesByUserId();
  }, [fetchUserSecretMessagesByUserId, selectedFriend?.user_id]);

  const handleEdit = useCallback(
    (message: Message) => {
      dispatch(setSelectedMessage(message));
    },
    [dispatch]
  );

  const handleBackToAll = useCallback(() => {
    dispatch(setSelectedFriend(null));
  }, [dispatch]);

  return (
    <section className="w-full px-4 py-6">
      <Card className="mx-auto w-full max-w-6xl bg-white">
        <Button
          variant="outline"
          className="ml-5 mt-5 w-full sm:w-auto"
          onClick={handleBackToAll}
          type="button"
        >
          Back to all secret messages
        </Button>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <CardTitle>{friendTitle} Secret Messages</CardTitle>
          </div>
          <Avatar className="mb-3 size-14 border-none bg-linear-to-br from-violet-100 to-fuchsia-100 shadow-inner shadow-white/70 sm:mb-0">
            {friendAvatarUrl && (
              <AvatarImage src={friendAvatarUrl} alt="Friend's avatar" />
            )}
            <AvatarFallback className="bg-transparent text-violet-600">
              {friendTitle
                ?.split(" ")
                ?.map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div className="mt-5 flex max-h-[900px] flex-col gap-4 overflow-y-auto pr-1">
            {isLoadingSecretMessages ? (
              <div className="flex justify-center py-10">
                <Spinner className="size-6 text-violet-600" />
              </div>
            ) : userSecretMessages.length === 0 ? (
              <EmptyPlaceholder
                icon={MailQuestion}
                title="No secrets just yet"
                description="Messages sent to you will show up here. Invite friends to share something fun!"
              />
            ) : (
              userSecretMessages.map((message: Message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  path={path}
                  onEdit={handleEdit}
                  isEditing={selectedMessage?.id === message.id}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

interface MessageCardProps {
  message: Message;
  path: string;
  onEdit: (message: Message) => void;
  isEditing?: boolean;
}

const MessageCard = ({
  message,
  path,
  onEdit,
  isEditing = false,
}: MessageCardProps) => {
  // Only show the 'Edit' button for /secret-page-2 and if the message is from "You"
  const isEditable =
    path === "/secret-page-2" && message?.selectedFriend?.name === "You";

  return (
    <article className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs font-medium uppercase tracking-wide text-violet-600">
          {formatRelativeTime(message.created_at)}
        </span>
      </div>

      <p className="mt-4 text-base leading-relaxed text-slate-700 mb-5">
        {message.content}
      </p>

      {message?.image_url && (
        <Image
          src={message.image_url}
          alt={message.id}
          height={200}
          width={200}
          className="rounded-lg object-cover"
        />
      )}
      <div className="mt-3 flex items-center justify-end text-xs">
        {/* <span className="font-semibold text-fuchsia-600">{message.vibe}</span> */}
        {isEditable && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
            onClick={() => onEdit(message)}
            aria-label="Edit message"
          >
            {isEditing ? "Editing…" : "Edit"}
          </Button>
        )}
      </div>
    </article>
  );
};

export default UserSecretMessages;
