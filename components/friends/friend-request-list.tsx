import React, { useEffect } from "react";
import { useRealtimeFriendRequests } from "../hooks/use-realtime-friend-requests";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { supabaseClient } from "@/utils/supabase/client";
import { setUserFriendRequests } from "@/lib/slices/user-slice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { EmptyPlaceholder } from "../ui/empty-placeholder";
import { Handshake } from "lucide-react";
import { FriendRequestWithSender } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const FriendRequestList = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { friendRequests } = useAppSelector((state) => state.user);

  const fetchFriendRequests = async () => {
    if (user?.id) {
      const { data, error } = await supabaseClient
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

  useRealtimeFriendRequests({
    onFriendRequestsChange: fetchFriendRequests,
  });

  useEffect(() => {
    fetchFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
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
        {friendRequests?.length === 0 ? (
          <EmptyPlaceholder
            icon={Handshake}
            title="No pending requests"
            description="Friend requests will show up here for you to accept or reject."
            className="mx-auto w-full max-w-sm"
          />
        ) : (
          <div className="flex max-h-[900px] flex-col gap-3 overflow-y-auto pr-1">
            {friendRequests?.map(
              (friend: FriendRequestWithSender, index: number) => (
                <article
                  key={friend.id ?? index}
                  className="rounded-3xl border border-rose-100 bg-white/90 p-4 shadow-[0_15px_45px_-35px_rgba(190,24,93,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200/70 hover:shadow-[0_18px_55px_-35px_rgba(190,24,93,0.5)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12 border border-rose-50 bg-linear-to-br from-rose-50 via-orange-50 to-amber-50">
                        <AvatarImage
                          src={
                            typeof friend.sender_id === "object" &&
                            "avatar_url" in friend.sender_id
                              ? friend.sender_id.avatar_url
                              : undefined
                          }
                        />
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
                        // onClick={() => handleAcceptFriendRequest(friend)}
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
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendRequestList;
