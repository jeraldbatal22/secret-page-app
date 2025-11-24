import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/utils/test-utils";
import FriendRequestList from "./friend-request-list";

// Mock friend request data for FriendRequestList
const mockFriendRequests = [
  {
    id: "request-1",
    sender_id: {
      id: "user-111",
      nickname: "Charlie Day",
      email: "charlie@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=charlie",
      created_at: "2024-06-15T09:00:00Z",
      updated_at: "2024-06-15T10:00:00Z",
    },
    receiver_id: "me-999",
    status: "pending",
    created_at: "2024-06-15T11:00:00Z",
    updated_at: "2024-06-15T11:01:00Z",
  },
  {
    id: "request-2",
    sender_id: {
      id: "user-222",
      nickname: "Dana Scully",
      email: "dana@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=dana",
      created_at: "2024-06-16T12:00:00Z",
      updated_at: "2024-06-16T13:00:00Z",
    },
    receiver_id: "me-999",
    status: "pending",
    created_at: "2024-06-16T13:30:00Z",
    updated_at: "2024-06-16T13:31:00Z",
  },
];

const mockUser = {
  id: "me-999",
  email: "current@example.com",
  nickname: "Current User",
};

// Store the original implementation so it can be restored/re-mocked as needed
let currentMockFriendRequests = mockFriendRequests;

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
        friendRequests: currentMockFriendRequests,
      },
    }),
  useAppDispatch: () => vi.fn(),
}));

describe("FriendRequestList", () => {
  it("renders all required texts for friend requests", () => {
    // Ensure standard mockFriendRequests for this test
    currentMockFriendRequests = mockFriendRequests;
    render(<FriendRequestList />);

    // Heading exists (level 3 - "People you trust")
    const headerTitle = screen.getByRole("heading", { level: 3 });
    expect(headerTitle).toHaveTextContent(/Incoming Friend Requests/i);
    const headerDescriptions = screen.getAllByRole("paragraph");
    expect(headerDescriptions[0]).toHaveTextContent(
      /Approve people before letting them peek at your secrets./i
    );
  });

  it('shows "No pending requests yet" when there are no friend request', () => {
    // Set mockFriendRequests to empty array for this test
    currentMockFriendRequests = [];
    render(<FriendRequestList />);
    expect(screen.getByText(/No pending requests/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Friend requests will show up here for you to accept or reject./i
      )
    ).toBeInTheDocument();
  });

  it("shows accept button, sender nickname, and correct request text for incoming friend requests", () => {
    currentMockFriendRequests = mockFriendRequests;

    render(<FriendRequestList />);

    mockFriendRequests.forEach((friend) => {
      expect(screen.getByText(friend.sender_id.nickname)).toBeInTheDocument();
    });

    const acceptFriendButtons = screen.getAllByRole("button", {
      name: /accept/i,
    });
    expect(acceptFriendButtons).toHaveLength(mockFriendRequests.length);
    expect(
      screen.getAllByText(/Wants to be friend with you./i)
    ).toHaveLength(mockFriendRequests.length);
  });
});
