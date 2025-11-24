import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReduxProvider from "@/lib/providers/ReduxProvider";
import RecommendedUsers from "./recommended-users";

// Mock profiles data
const mockProfiles = [
  {
    id: "user-123",
    nickname: "Alice Wonder",
    email: "alice@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=alice",
    created_at: "2024-06-10T10:00:00Z",
    updated_at: "2024-06-10T12:00:00Z",
  },
  {
    id: "user-456",
    nickname: "Bob Builder",
    email: "bob@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=bob",
    created_at: "2024-06-11T09:05:00Z",
    updated_at: "2024-06-11T09:45:00Z",
  },
  {
    id: "user-789",
    nickname: "Cara Stone",
    email: "cara@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=cara",
    created_at: "2024-06-12T15:23:00Z",
    updated_at: "2024-06-12T18:12:00Z",
  },
];

const mockUser = {
  id: "me-999",
  email: "current@example.com",
  nickname: "Current User",
};

describe("RecommendedUsers", () => {
  // Cannot spy on useSelector in ESM, so use a custom mock for 'react-redux' instead
  vi.mock("@/lib/hooks", () => ({
    useAppSelector: (selector: any) =>
      selector({
        auth: { user: mockUser },
        user: { profiles: mockProfiles },
      }),
    useAppDispatch: () => vi.fn(),
  }));

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReduxProvider>{children}</ReduxProvider>
  );

  it("renders all required text", () => {
    render(<RecommendedUsers />, { wrapper: Wrapper });

    // Heading exists
    const headerTitle = screen.getByRole("heading", { level: 3 });
    expect(headerTitle).toHaveTextContent(/Recommended User/i);

    // Render a View Secret Messages button for each profile (except when profiles empty)
    const viewButtons = screen.getAllByRole("button", {
      name: /view secret messages/i,
    });
    expect(viewButtons).toHaveLength(mockProfiles.length);

    // Render an Add as friend button for each profile
    const addFriendButtons = screen.getAllByRole("button", {
      name: /add as friend/i,
    });
    expect(addFriendButtons).toHaveLength(mockProfiles.length);
  });

  it("renders all mock profiles", () => {
    render(<RecommendedUsers />, { wrapper: Wrapper });

    // Each mock nickname renders
    mockProfiles.forEach((profile) => {
      expect(screen.getByText(profile.nickname)).toBeInTheDocument();
    });

    const infoMessages = screen.getAllByText(
      /Add this user as a friend to view secret messages./i
    );
    expect(infoMessages).toHaveLength(mockProfiles.length);


    const avatars = screen.getAllByTestId("avatar-container");
    expect(avatars).toHaveLength(mockProfiles.length);
  });
});
