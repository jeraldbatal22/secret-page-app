"use client";
import AllUsersSecretMessages from "@/components/all-users-secret-messages";
import { FriendList } from "@/components/friend-list";
import RecommendedUsers from "@/components/recommended-users";
import UserSecretMessages from "@/components/user-secret-messages";
import { useAppSelector } from "@/lib/hooks";

const SecretPageThree = () => {
  const { selectedFriend } = useAppSelector((state) => state.user);
  return (
    <div className="flex w-full flex-col gap-8 xl:flex-row xl:items-start">
      <div className="w-full xl:max-w-md space-y-5">
        <FriendList />
        <RecommendedUsers />
      </div>
      <div className="w-full flex-1">
        {selectedFriend ? <UserSecretMessages /> : <AllUsersSecretMessages />}
      </div>
    </div>
  );
};

export default SecretPageThree;
