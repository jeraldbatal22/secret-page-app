import { Handshake, Users } from "lucide-react";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "../ui/tabs";
import { useAppSelector } from "@/lib/hooks";
import FriendRequestList from "./friend-request-list";
import { FriendList } from "./friend-list";

const Friends = () => {
  const { friendRequests, friends } = useAppSelector((state) => state.user);
  return (
    <div className="flex w-full max-w-full flex-col gap-6 lg:max-w-md">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-inner">
          <TabsTrigger
            value="friends"
            className="flex items-center justify-center gap-2 rounded-xl"
          >
            <Users className="size-4 text-slate-600" />
            <span className="text-sm font-semibold">Friends</span>
            <span className="rounded-full bg-slate-900/5 px-1.5 text-xs font-semibold text-slate-600">
              {friends?.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex items-center justify-center gap-2 rounded-xl"
          >
            <Handshake className="size-4 text-slate-600" />
            <span className="text-sm font-semibold">Requests</span>
            <span className="rounded-full bg-slate-900/5 px-1.5 text-xs font-semibold text-slate-600">
              {friendRequests?.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="mt-6">
          <FriendList />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <FriendRequestList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
