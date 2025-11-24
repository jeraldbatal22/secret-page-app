import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { FriendList } from "./friend-list";
import { render } from "@/utils/test-utils";

// Mock friends data for FriendList
const mockProfiles = [
  {
    id: "friendship-1",
    user_id: {
      id: "me-999",
      nickname: "Current User",
      email: "current@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=me-999",
      created_at: "2024-06-09T11:00:00Z",
      updated_at: "2024-06-09T12:00:00Z",
    },
    friend_id: {
      id: "user-123",
      nickname: "Alice Wonder",
      email: "alice@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=alice",
      created_at: "2024-06-10T10:00:00Z",
      updated_at: "2024-06-10T12:00:00Z",
    },
    messagesCount: 5,
    latestMessage: {
      id: "msg-1",
      content: "Hey Alice!",
      sender_id: "me-999",
      created_at: "2024-06-13T14:52:00Z",
      image_url: null,
    },
    isSelf: false,
    avatarUrl: "https://i.pravatar.cc/150?u=alice",
    status: "accepted",
  },
  {
    id: "friendship-2",
    user_id: {
      id: "me-999",
      nickname: "Current User",
      email: "current@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=me-999",
      created_at: "2024-06-09T11:00:00Z",
      updated_at: "2024-06-09T12:00:00Z",
    },
    friend_id: {
      id: "user-456",
      nickname: "Bob Builder",
      email: "bob@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=bob",
      created_at: "2024-06-11T09:05:00Z",
      updated_at: "2024-06-11T09:45:00Z",
    },
    messagesCount: 2,
    latestMessage: {
      id: "msg-2",
      content: "Ready to build?",
      sender_id: "user-456",
      created_at: "2024-06-13T15:15:00Z",
      image_url: null,
    },
    isSelf: false,
    avatarUrl: "https://i.pravatar.cc/150?u=bob",
    status: "pending",
  },
];

const mockUser = {
  id: "me-999",
  email: "current@example.com",
  nickname: "Current User",
};

// Store the original implementation so it can be restored/re-mocked as needed
let currentMockProfiles = mockProfiles;

// Mock supabase client
vi.mock("@/utils/supabase/client", () => {
  const mockResponse = { data: [{ id: "msg1" }], error: null };

  const chainable = {
    eq: vi.fn(() => chainable),
    or: vi.fn(() => chainable),
    order: vi.fn(() => Promise.resolve(mockResponse)), // final resolves the data
    single: vi.fn(() => Promise.resolve({ data: mockUser, error: null })),
    select: vi.fn(() => chainable),
  };

  return {
    supabaseClient: {
      from: vi.fn(() => chainable),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
      })),
    },
  };
});

vi.mock("@/lib/hooks", () => ({
  useAppSelector: (selector: any) =>
    selector({
      auth: { user: mockUser },
      user: {
        friends: currentMockProfiles,
        friendRequests: [],
        selectedFriend: null,
      },
    }),
  useAppDispatch: () => vi.fn(),
}));

describe("FriendList", () => {
  it("renders all required texts for friends", () => {
    // Ensure standard mockProfiles for this test
    currentMockProfiles = mockProfiles;
    render(<FriendList />);

    // Heading exists (level 3 - "People you trust")
    const headerTitle = screen.getByRole("heading", { level: 3 });
    expect(headerTitle).toHaveTextContent(/People you trust/i);
    const headerDescriptions = screen.getAllByRole("paragraph");
    expect(headerDescriptions[0]).toHaveTextContent(
      /Tap someone to open your shared secret thread./i
    );

    // Each friend's nickname (except "You")
    mockProfiles.forEach((friend) => {
      if (!friend.isSelf)
        expect(
          screen.getByText(friend.friend_id.nickname, { exact: false })
        ).toBeInTheDocument();
    });

    // Latest message or default message text
    mockProfiles.forEach((friend) => {
      if (friend.latestMessage?.content) {
        expect(
          screen.getByText(friend.latestMessage.content)
        ).toBeInTheDocument();
      }
    });

    // Secret count badge (e.g. "5 secrets", "2 secrets")
    mockProfiles.forEach((friend) => {
      const badgeText =
        (friend.messagesCount ?? 0) +
        " " +
        ((friend.messagesCount ?? 0) === 1 ? "secret" : "secrets");
      expect(screen.getByText(badgeText)).toBeInTheDocument();
    });
  });

  // it('shows "No friends added yet" when there are no friends', () => {
  //   // Set mockProfiles to empty array for this test
  //   currentMockProfiles = [];
  //   render(<FriendList />);
  //   expect(screen.getByText(/No friends added yet/i)).toBeInTheDocument();
  //   expect(
  //     screen.getByText(
  //       /When you add friends, you can start trading secret messages./i
  //     )
  //   ).toBeInTheDocument();
  // });

  // it("renders all required texts for friend requests", () => {
  //   // Ensure standard mockProfiles for this test
  //   currentMockProfiles = mockProfiles;
  //   render(<FriendList />);

  //   // Heading exists (level 3 - "People you trust")
  //   const headerTitle = screen.getByRole("heading", { level: 3 });
  //   expect(headerTitle).toHaveTextContent(/Incoming Friend Requests/i);
  //   // const headerDescriptions = screen.getAllByRole("paragraph");
  //   // expect(headerDescriptions[0]).toHaveTextContent(
  //   //   /Approve people before letting them peek at your secrets../i
  //   // );

  //   // // Each friend's nickname (except "You")
  //   // mockProfiles.forEach((friend) => {
  //   //   if (!friend.isSelf)
  //   //     expect(
  //   //       screen.getByText(friend.friend_id.nickname, { exact: false })
  //   //     ).toBeInTheDocument();
  //   // });

  //   // // Latest message or default message text
  //   // mockProfiles.forEach((friend) => {
  //   //   if (friend.latestMessage?.content) {
  //   //     expect(
  //   //       screen.getByText(friend.latestMessage.content)
  //   //     ).toBeInTheDocument();
  //   //   }
  //   // });

  //   // // Secret count badge (e.g. "5 secrets", "2 secrets")
  //   // mockProfiles.forEach((friend) => {
  //   //   const badgeText =
  //   //     (friend.messagesCount ?? 0) +
  //   //     " " +
  //   //     ((friend.messagesCount ?? 0) === 1 ? "secret" : "secrets");
  //   //   expect(screen.getByText(badgeText)).toBeInTheDocument();
  //   // });
  // });

  // // it('shows "No pending requests yet" when there are no friend request', () => {
  // //   // Set mockProfiles to empty array for this test
  // //   currentMockProfiles = [];
  // //   render(<FriendList />);
  // //   expect(screen.getByText(/No pending requests/i)).toBeInTheDocument();
  // //   expect(
  // //     screen.getByText(
  // //       /Friend requests will show up here for you to accept or reject./i
  // //     )
  // //   ).toBeInTheDocument();
  // // });
});
