// "use client";
// import { ErrorDisplay } from "@/components/error-display";
// import Friends from "@/components/friends";
// import UserSecretMessages from "@/components/messages/user-secret-messages";
// import UsersSecretMessages from "@/components/messages/users-secret-messages";
// import RecommendedUsers from "@/components/recommended-users";
// import { useAppSelector } from "@/lib/hooks";

// interface I_ResultResponse {
//   success: boolean;
//   data: any[];
//   error?: string;
//   code: string;
// }

// interface SecretPageThreeComponentProps {
//   friendRequestsData: I_ResultResponse;
//   friendsData: I_ResultResponse;
//   usersMessagesData: I_ResultResponse;
// }

// const SecretPageThreeComponent = ({
//   friendRequestsData,
//   friendsData,
//   usersMessagesData,
// }: SecretPageThreeComponentProps) => {
//   const { selectedFriend } = useAppSelector((state) => state.user);

//   return (
//     <div className="flex w-full flex-col gap-8 xl:flex-row xl:items-start">
//       <div className="w-full xl:max-w-md space-y-5">
//         <Friends
//           friendsData={friendsData}
//           friendRequestsData={friendRequestsData}
//         />
//         {friendsData.success ? (
//           <RecommendedUsers />
//         ) : (
//           <ErrorDisplay error={friendsData?.error} code={friendsData?.code} />
//         )}
//       </div>
//       <div className="w-full flex-1">
//         {selectedFriend ? (
//           <UserSecretMessages />
//         ) : usersMessagesData.success ? (
//           <UsersSecretMessages messagesData={usersMessagesData.data as any} />
//         ) : (
//           <ErrorDisplay
//             error={usersMessagesData?.error}
//             code={usersMessagesData?.code}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SecretPageThreeComponent;
