import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SecretMessageState, Message, MessageWithSender } from "@/types";

// const MOCK_MESSAGES = [
//   {
//     id: "1",
//     user: {
//       id: "you",
//       name: "You",
//     },
//     message:
//       "Accidentally deployed to prod on my first day. Nobody noticed, but I triple-check every git push now.",
//     sentAt: "2m ago",
//   },
//   {
//     id: "2",
//     user: {
//       id: "milo-chicago",
//       name: "Milo Hart",
//     },
//     message: "I only review PRs after midnight because I'm braver when sleepy.",
//     sentAt: "14m ago",
//   },
//   {
//     id: "3",
//     user: {
//       id: "you",
//       name: "You",
//     },
//     message:
//       "I pretended an AI wrote my code to see if PMs would be nicer. It worked.",
//     sentAt: "25m ago",
//   },
//   {
//     id: "4",
//     user: {
//       id: "luna-madrid",
//       name: "Luna Madrid",
//     },
//     message:
//       "Every daily standup update is just a remix of the same three sentences.",
//     sentAt: "58m ago",
//   },
//   {
//     id: "5",
//     user: {
//       id: "you",
//       name: "You",
//     },
//     message:
//       "My 'productivity tracking spreadsheet' is actually a list of cafés with the best croissants.",
//     sentAt: "1h ago",
//   },
//   {
//     id: "6",
//     user: {
//       id: "leo-berlin",
//       name: "Leo Brandt",
//     },
//     message:
//       "Wrote a script that compliments me every time tests pass. Morale-as-a-service.",
//     sentAt: "3h ago",
//   },
// ];

const initialState: SecretMessageState = {
  messages: [],
  selectedMessage: null,
};

const secretMessageSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSelectedMessage: (state, action: PayloadAction<Message | null>) => {
      state.selectedMessage = action.payload;
    },
    setMessages: (state, action: PayloadAction<MessageWithSender[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { setSelectedMessage, setMessages } = secretMessageSlice.actions;

export default secretMessageSlice.reducer;
