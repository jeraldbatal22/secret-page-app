"use client";
import Friends from "@/components/friends";
import { RealtimeChat } from "@/components/messages/chat/realtime-chat";
import UserSecretMessages from "@/components/messages/user-secret-messages";
import UsersSecretMessages from "@/components/messages/users-secret-messages";
import { useAppSelector } from "@/lib/hooks";

const SecretPageThree = () => {
  const { selectedFriend } = useAppSelector((state) => state.user);
  return (
    <div className="flex w-full flex-col gap-0 md:gap-8 xl:flex-row xl:items-start">
      <div className="w-full xl:max-w-md space-y-5">
        <Friends />
      </div>
      <div className="w-full flex-1">
        {selectedFriend?.type === "view-chat" ? (
          <RealtimeChat />
        ) : selectedFriend?.type === "view-secret-message" ? (
          <UserSecretMessages />
        ) : (
          <UsersSecretMessages />
        )}
      </div>
    </div>
  );
};

export default SecretPageThree;
