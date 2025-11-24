// Database entity types
export interface Profile {
  id: string;
  nickname?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string | Profile;
  created_at: string;
  image_url?: string | null;
  selectedFriend?: {
    name: string;
  };
}

export interface MessageWithSender extends Omit<Message, "sender_id"> {
  sender_id: Profile;
}

export interface Friend {
  id?: string;
  user_id: string | Profile;
  friend_id: string | Profile;
  messagesCount?: number;
  latestMessage?: Message | null;
  isSelf?: boolean;
  avatarUrl?: string;
  status?: "pending" | "accepted";
}

export interface FriendWithProfiles extends Omit<Friend, "user_id" | "friend_id"> {
  id?: string;
  user_id: Profile;
  friend_id: Profile;
}

export interface FriendRequest {
  id: string;
  sender_id: string | Profile;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at?: string;
}

export interface FriendRequestWithSender extends Omit<FriendRequest, "sender_id"> {
  sender_id: Profile;
}

// Redux state types
export interface UserState {
  friends: FriendWithProfiles[];
  selectedFriend: FriendWithProfiles | null;
  userSecretMessages: Message[];
  friendRequests: FriendRequestWithSender[];
  profiles: Profile[];
}

export interface SecretMessageState {
  messages: MessageWithSender[];
  selectedMessage: Message | null;
}

// API types
export interface DeleteAccountRequest {
  userId: string;
}

export interface DeleteAccountResponse {
  success?: boolean;
  error?: string;
}

// Toast options type
export interface ToastOptions {
  title?: string;
  description?: string;
  richColors?: boolean;
  position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right";
  duration?: number;
}

// Supabase Session type
export interface SupabaseSession {
  user: {
    id: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
  };
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
}

