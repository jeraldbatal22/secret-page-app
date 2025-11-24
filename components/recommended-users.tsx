import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { EmptyPlaceholder } from "./ui/empty-placeholder";
import { Handshake } from "lucide-react";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { supabaseClient } from "@/utils/supabase/client";
import { setProfiles } from "@/lib/slices/user-slice";
import { showToast } from "@/lib/utils";
import type { Profile } from "@/types";
import { useRealtimeFriendRequests } from "./hooks/use-realtime-friend-requests";

const RecommendedUsers = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { profiles } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const fetchRecommendedUsers = async () => {
    if (user?.id) {
      const supabase = supabaseClient();

      // 1. Get friend IDs
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id);

        const friendIds = friends?.map((f) => f.friend_id) ?? [];

      // 2. Build query
      let query = supabase.from("profiles").select("*").neq("id", user.id);

      // 3. Apply NOT IN only if there are friend IDs
      if (friendIds.length > 0) {
        query = query.not("id", "in", `(${friendIds.join(",")})`);
      }

      const { data: profiles, error } = await query;

      if (error) {
        showToast(error.message, "error");
      }

      if (error) {
        showToast(error.message, "error");
      } else {
        dispatch(setProfiles(profiles));
      }
    }
  };

  useRealtimeFriendRequests({
    onFriendRequestsChange: fetchRecommendedUsers,
  });

  useEffect(() => {
    fetchRecommendedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddAsFriend = async (profile: Profile) => {
    // 1️⃣ First check if a pending request already exists (both directions)
    const { data: existingRequests, error: existingError } =
      await supabaseClient()
        .from("friend_requests")
        .select("*")
        .or(
          `and(sender_id.eq.${user?.id},receiver_id.eq.${profile?.id}),` +
            `and(sender_id.eq.${profile?.id},receiver_id.eq.${user?.id})`
        )
        .in("status", ["pending"]);

    if (existingError) {
      return showToast(existingError.message, "error");
    }
    // If a pending request exists either direction
    if (existingRequests?.some((r) => r.status === "pending")) {
      return showToast("Already Pending Friend Request", "error");
    }

    // 2️⃣ Insert new friend request
    const { error } = await supabaseClient()
      .from("friend_requests")
      .insert([
        {
          sender_id: user?.id,
          receiver_id: profile?.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      // Unique constraint error — already pending
      if (error.code === "23505") {
        return showToast("Already Pending Friend Request", "error");
      }
      return showToast(error.message, "error");
    } else {
      showToast("Successfully requested friend request", "success");
    }
  };

  const handleViewSecretMessagesByProfile = (profile: Profile) => {
    console.log(profile);
    showToast("", "error", {
      title: "401",
      description:
        " You must be friends with this user to view their secret messages.",
    });
  };

  return (
    <Card className="border-none bg-linear-to-b from-white to-rose-50/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-900">
          Recommended User
        </CardTitle>
        <CardDescription>
          {/* Approve people before letting them peek at your secrets. */}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profiles.length === 0 ? (
          <EmptyPlaceholder
            icon={Handshake}
            title="No pending requests"
            description="Friend requests will show up here for you to accept or reject."
            className="mx-auto w-full max-w-sm"
          />
        ) : (
          <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-1">
            {profiles.map((profile: Profile, index: number) => (
              <article
                key={profile.id ?? index}
                className="rounded-3xl border border-rose-100 bg-white/90 p-4 shadow-[0_15px_45px_-35px_rgba(190,24,93,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200/70 hover:shadow-[0_18px_55px_-35px_rgba(190,24,93,0.5)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 border border-rose-50 bg-linear-to-br from-rose-50 via-orange-50 to-amber-50">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-sm font-semibold text-rose-600">
                        {profile?.nickname
                          ?.split(" ")
                          .map((part: string) => part?.[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile?.nickname}
                      </p>
                      <p className="text-xs text-slate-500">
                        Add this user as a friend to view secret messages.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end w-full  gap-2  sm:flex-col sm:gap-3">
                    <Button
                      type="button"
                      onClick={() => handleAddAsFriend(profile)}
                      className="w-full rounded-2xl bg-linear-to-r from-violet-500 to-indigo-500 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-600 sm:w-auto"
                      variant="secondary"
                    >
                      Add as friend
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleViewSecretMessagesByProfile(profile)}
                      variant="secondary"
                    >
                      View Secret Messages
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedUsers;
