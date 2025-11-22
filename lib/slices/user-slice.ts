import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  UserState,
  FriendWithProfiles,
  Message,
  FriendRequestWithSender,
  Profile,
} from "@/types";

// const MOCK_FRIENDS = [
//   {
//     id: "you",
//     name: "You",
//   },
//   {
//     id: "milo-chicago",
//     name: "Milo Hart",
//     avatarUrl: "https://i.pravatar.cc/150?u=milo-chicago",
//     status: "approved",
//   },
//   {
//     id: "luna-madrid",
//     name: "Luna Ávila",
//     avatarUrl: "https://i.pravatar.cc/150?u=luna-madrid",
//     status: "approved",
//   },
//   {
//     id: "leo-berlin",
//     name: "Leo Brandt",
//     avatarUrl: "https://i.pravatar.cc/150?u=leo-berlin",
//     status: "pending",
//   },
// ];

const initialState: UserState = {
  profiles: [],
  friends: [],
  friendRequests: [],
  selectedFriend: null,
  userSecretMessages: [],
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserFriends: (state, action: PayloadAction<FriendWithProfiles[]>) => {
      state.friends = action.payload;
    },
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload;
    },
    setUserFriendRequests: (state, action: PayloadAction<FriendRequestWithSender[]>) => {
      state.friendRequests = action.payload;
    },
    setSelectedFriend: (state, action: PayloadAction<FriendWithProfiles | null>) => {
      state.selectedFriend = action.payload;
    },
    setUserSecretMessages: (state, action: PayloadAction<Message[]>) => {
      state.userSecretMessages = action.payload;
    },
  },
});

export const {
  setSelectedFriend,
  setUserSecretMessages,
  setUserFriends,
  setUserFriendRequests,
  setProfiles
} = userSlice.actions;

export default userSlice.reducer;
