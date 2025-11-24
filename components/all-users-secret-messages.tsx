"use client";
import { Puzzle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setMessages,
  setSelectedMessage,
} from "@/lib/slices/secret-message-silce";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { Spinner } from "./ui/spinner";
import { EmptyPlaceholder } from "./ui/empty-placeholder";
import Image from "next/image";
import type { MessageWithSender } from "@/types";
import { useRealtimeMessages } from "./hooks/use-realtime-messages";

const AllUsersSecretMessages = () => {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const { messages, selectedMessage } = useAppSelector(
    (state) => state.secretMessage
  );
  const { user } = useAppSelector((state) => state.auth);
  // const [isOpenSecretModalOptions, setisOpenSecretModalOptions] =
  //   useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const handleEdit = (message: MessageWithSender) => {
    dispatch(setSelectedMessage(message));
  };

  const fetchAllMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const supabase = supabaseClient;
      const { data: fetchedMessages, error } = await supabase
        .from("messages")
        .select(`*, sender_id(*)`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      dispatch(setMessages(fetchedMessages ?? []));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch secret messages.";
      toast.error(errorMessage, {
        richColors: true,
        position: "top-center",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useRealtimeMessages({
    onMessagesChange: fetchAllMessages,
  });
  
  useEffect(() => {
    fetchAllMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full px-4 py-6">
      <Card className="mx-auto w-full max-w-6xl bg-white">
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Secret Messages</CardTitle>
            <p className="text-sm text-muted-foreground">
              Say hello to everyone hanging out here.
            </p>
          </div>
          <Avatar className="mb-3 size-14 border-none bg-linear-to-br from-violet-100 to-fuchsia-100 shadow-inner shadow-white/70 sm:mb-0">
            <AvatarFallback className="bg-transparent text-violet-600">
              <Puzzle className="size-6" strokeWidth={1.8} />
            </AvatarFallback>
          </Avatar>
        </CardHeader>

        <CardContent>
          <div className="flex max-h-[900px] flex-col gap-4 overflow-y-auto pr-1 mt-5">
            {isLoadingMessages && (
              <div className="flex relative justify-center py-10">
                <Spinner className="size-6 text-violet-600" />
              </div>
            )}

            {!isLoadingMessages && messages.length === 0 && (
              <EmptyPlaceholder
                icon={Puzzle}
                title="No secret messages yet"
                description="Once someone shares a secret, it will appear here. Be the first to drop one!"
              />
            )}

            {!isLoadingMessages &&
              messages.map((message: MessageWithSender, index: number) => (
                <article
                  key={index}
                  className={` rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200/70 hover:shadow-[0_18px_55px_-35px_rgba(109,40,217,0.6)]`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border border-slate-100 bg-linear-to-br from-violet-100 via-pink-50 to-orange-50">
                        <AvatarFallback className="text-sm font-semibold text-violet-700">
                          {message.sender_id?.nickname
                            ?.split(" ")
                            ?.map((part: string) => part[0])
                            ?.join("")
                            ?.slice(0, 2)
                            ?.toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {message.sender_id?.id === user?.id
                            ? "You"
                            : message.sender_id?.nickname}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-medium uppercase tracking-wide text-violet-600 sm:text-right">
                      {formatRelativeTime(message.created_at)}
                    </span>
                  </div>

                  <p className="my-4 text-base leading-relaxed text-slate-700">
                    {message.content}
                  </p>

                  {message?.image_url && (
                    <Image
                      src={message?.image_url}
                      alt={message.id}
                      height={200}
                      width={200}
                    />
                  )}

                  <div className="mt-3 flex items-center justify-end text-xs">
                    {/* <span className="font-semibold text-fuchsia-600">
                    {message.vibe}
                  </span> */}
                    {path === "/secret-page-2" &&
                      message?.sender_id?.id === user?.id && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                          onClick={() => handleEdit(message)}
                        >
                          {selectedMessage?.id === message.id
                            ? "Editing…"
                            : "Edit"}
                        </Button>
                      )}
                  </div>
                </article>
              ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AllUsersSecretMessages;
