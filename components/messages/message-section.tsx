// import { Result } from "@/types";
// import { supabaseServerClient } from "@/utils/supabase/server";
// import UsersSecretMessages from "./users-secret-messages";
// import { ErrorDisplay } from "../error-display";

// export async function fetchMessages(): Promise<Result<any[]>> {
//   try {
//     const supabase = await supabaseServerClient();

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     // Step 1: Fetch all messages with sender profiles
//     const { data: messages, error } = await supabase
//       .from("messages")
//       .select("*, sender_id(*)")
//       .order("created_at", { ascending: false });

//     if (error) {
//       return {
//         success: false,
//         error: "Failed to load messages. Please try again.",
//         code: "DB_ERROR",
//       };
//     }

//     // Step 2: Get unique sender IDs (excluding current user)
//     const senderIds = [
//       ...new Set(
//         messages
//           ?.filter((m) => m.sender_id?.id !== user?.id)
//           .map((m) => m.sender_id?.id)
//           .filter(Boolean) || []
//       ),
//     ];

//     if (senderIds.length === 0) {
//       // No other users' messages to check friendship for
//       return { success: true, data: messages || [] };
//     }

//     // Step 3: Fetch friendships in bulk
//     const { data: friendships } = await supabase
//       .from("friends")
//       .select("user_id, friend_id, status")
//       .or(
//         `and(user_id.eq.${user?.id},friend_id.in.(${senderIds.join(
//           ","
//         )})),and(friend_id.eq.${user?.id},user_id.in.(${senderIds.join(",")}))`
//       );

//     // Step 4: Fetch friend requests in bulk
//     const { data: friendRequests } = await supabase
//       .from("friend_requests")
//       .select("sender_id, receiver_id, status")
//       .or(
//         `and(sender_id.eq.${user?.id},receiver_id.in.(${senderIds.join(
//           ","
//         )})),and(receiver_id.eq.${user?.id},sender_id.in.(${senderIds.join(
//           ","
//         )}))`
//       );

//     // Step 5: Create lookup map
//     const friendshipMap = new Map();

//     friendships?.forEach((f) => {
//       const otherId = f.user_id === user?.id ? f.friend_id : f.user_id;
//       friendshipMap.set(otherId, { type: "friend", status: f.status });
//     });

//     friendRequests?.forEach((fr) => {
//       const otherId = fr.sender_id === user?.id ? fr.receiver_id : fr.sender_id;
//       if (!friendshipMap.has(otherId)) {
//         friendshipMap.set(otherId, {
//           type: "request",
//           status: fr.status,
//           isSender: fr.sender_id === user?.id,
//         });
//       }
//     });
//     console.log(friendRequests);
//     console.log(friendshipMap);
//     // Step 6: Map friendship status to messages
//     const messagesWithFriendship = messages?.map((msg) => {
//       if (msg.sender_id?.id === user?.id) {
//         return { ...msg, friendship_status: "self" };
//       }

//       const friendship = friendshipMap.get(msg.sender_id?.id);
//       console.log(friendship);
//       let friendship_status = "none";
//       if (friendship?.status === "accepted") {
//         friendship_status = "friends";
//       } else if (friendship?.status === "pending") {
//         friendship_status = friendship.isSender
//           ? "pending_sent"
//           : "pending_received";
//       }

//       return { ...msg, friendship_status };
//     });

//     console.log(messagesWithFriendship);

//     if (error) {
//       // Log but don't expose internal error
//       console.error("[fetchMessages]", error);

//       return {
//         success: false,
//         error: "Failed to load messages. Please try again.",
//         code: "DB_ERROR",
//       };
//     }

//     return { success: true, data: messagesWithFriendship || [] };
//   } catch (error) {
//     console.error("[fetchMessages] Unexpected error:", error);

//     return {
//       success: false,
//       error: "Something went wrong. Please refresh the page.",
//       code: "UNKNOWN_ERROR",
//     };
//   }
// }

// export async function MessagesSection() {
//   const result = await fetchMessages();
//   return result.success ? (
//     <UsersSecretMessages messagesData={result.data as any} />
//   ) : (
//     <ErrorDisplay error={result?.error} code={result?.code} />
//   );
// }
