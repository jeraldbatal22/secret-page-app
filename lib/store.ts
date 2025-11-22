import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./slices/auth-slice";
import secretMessageSlice from "./slices/secret-message-silce";
import userSlice from "./slices/user-slice";

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  secretMessage: secretMessageSlice,
  user: userSlice,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Attach store to axios lazily to avoid circular imports
// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
