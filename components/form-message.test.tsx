import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import FormMessage from "./form-message";
import { render } from "@/utils/test-utils";
import { Message } from "@/types";
import { showToast } from "@/lib/utils";

// Set up environment variables before tests
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});

// Basic user and secretMessage mocks
const mockUser = { id: "test-user", email: "user@test.com" };
const mockSelectedMessage: Message | null = {
  id: "msg-123",
  content: "This is a test message",
  sender_id: "test-user",
  created_at: "2024-04-15T12:34:56.000Z",
  image_url: "https://dummyimage.com/abc.png",
  selectedFriend: { name: "Friend Name" },
};

const dispatchMock = vi.fn();

const insertFn = vi.fn<
  (payload: {
    content: string;
    image_url?: string;
    sender_id: string;
  }) => Promise<{ error: null }>
>(() => Promise.resolve({ error: null }));
const updateFn = vi.fn(() => Promise.resolve({ error: null }));
const uploadFn = vi.fn(() => Promise.resolve({ error: null }));
const getPublicUrlFn = vi.fn(() => ({ data: { publicUrl: "https://url" } }));

vi.mock("@/utils/supabase/client", () => {
  const updateEq = {
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  const updateBuilder = {
    update: vi.fn((payload) => {
      // Assert in mock that payload is what you expect
      // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
      updateFn(payload); // call your original mock for test assertion
      return updateEq;
    }),
    eq: vi.fn(() => updateEq),
  };

  const fromMock = vi.fn(() => ({
    insert: insertFn,
    update: updateBuilder.update,
    eq: updateBuilder.eq,
  }));

  return {
    supabaseClient: {
      from: fromMock,
      storage: {
        from: () => ({
          upload: uploadFn,
          getPublicUrl: getPublicUrlFn,
        }),
      },
    },
  };
});

// vi.mock("@/utils/supabase/client", () => ({
//   supabaseClient: {
//     from: () => ({
//       insert: insertFn,
//       update: updateFn,
//       eq: () => ({
//         update: updateFn,
//       }),
//     }),
//     storage: {
//       from: () => ({
//         upload: uploadFn,
//         getPublicUrl: getPublicUrlFn,
//       }),
//     },
//   },
// }));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>(
    "@/lib/utils"
  );
  return {
    ...actual,
    showToast: vi.fn(),
  };
});

let currentMockSelectedMessage = mockSelectedMessage;

describe("FormMessage", () => {
  vi.mock("@/lib/hooks", () => ({
    useAppSelector: (selector: any) =>
      selector({
        auth: { user: mockUser },
        secretMessage: { selectedMessage: currentMockSelectedMessage },
      }),
    useAppDispatch: () => dispatchMock,
  }));

  beforeEach(() => {
    // reset all mocks and message state
    // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
    currentMockSelectedMessage = null;
    insertFn.mockClear();
    updateFn.mockClear();
    uploadFn.mockClear();
    getPublicUrlFn.mockClear();
  });

  it("renders form title and empty message input for new message", () => {
    // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
    currentMockSelectedMessage = null; // <-- ensure new message state
    render(<FormMessage />);

    expect(
      screen.getByRole("heading", {
        name: /create or udpate your own secret message/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tell your story/i)).toBeInTheDocument();

    // File input exists only for new message
    expect(screen.getByLabelText(/image/i)).toBeInTheDocument();

    // Save button
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows correct button for edit mode and hides image upload", () => {
    currentMockSelectedMessage = mockSelectedMessage;
    render(<FormMessage />);

    const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(currentMockSelectedMessage.content);
    // Image upload should not be rendered in edit mode
    expect(screen.queryByLabelText(/image/i)).not.toBeInTheDocument();

    // // Buttons: update and cancel edit
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancel edit/i })
    ).toBeInTheDocument();
  });

  it("does not submit when message is blank", async () => {
    // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
    currentMockSelectedMessage = null; // ensure "Save" button shows
    render(<FormMessage />);

    // Flexible matcher ignoring nested icons
    const btn = screen.getByRole("button", {
      name: (content) => /save/i.test(content ?? ""),
    });

    expect(btn).toBeDisabled();
  });

  it("calls insert on submit with message and clears form", async () => {
    // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
    currentMockSelectedMessage = null;

    render(<FormMessage />);

    const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "TEST CONTENT" } });
    expect(textarea.value).toBe("TEST CONTENT");

    // submit form
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    await waitFor(() => {
      expect(insertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "TEST CONTENT",
          sender_id: mockUser.id,
        })
      );
    });
  });

  it("calls update on submit in edit mode", async () => {
    currentMockSelectedMessage = mockSelectedMessage;
    render(<FormMessage />);

    const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Changed message" } });

    const updateBtn = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({ content: "Changed message" })
      );
    });
  });

  it("uploads image and attaches url if file selected (new message)", async () => {
    // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
    currentMockSelectedMessage = null;

    render(<FormMessage />);
    const textarea = screen.getByLabelText(/message/i);
    fireEvent.change(textarea, { target: { value: "hello with image" } });

    const file = new File(["file-content"], "pic.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/image/i) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const btn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(uploadFn).toHaveBeenCalled();
      expect(getPublicUrlFn).toHaveBeenCalled();
      expect(insertFn.mock.calls[0][0]).toHaveProperty(
        "image_url",
        "https://url"
      );
    });
  });

  it("shows toast and resets inputs after submit", async () => {
    render(<FormMessage />);

    // fill message
    const textarea = screen.getByLabelText(/message/i);
    fireEvent.change(textarea, { target: { value: "New toast" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Successfully added secret message!",
        expect.any(String)
      );
      expect(
        (screen.getByLabelText(/message/i) as HTMLTextAreaElement).value
      ).toBe("");
    });
  });

  it("shows toast for update and clears edit", async () => {
    // Make sure selectedMessage is set so the button says "Update"
    currentMockSelectedMessage = mockSelectedMessage;
    render(<FormMessage />);

    const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Changed!" } });

    const btn = screen.getByRole("button", { name: /update/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Successfully updated secret message!",
        "success"
      );
    });

    // Optionally: assert that textarea is cleared after update
    expect(textarea.value).toBe("");
  });

  it("cancel edit resets state", () => {
    currentMockSelectedMessage = mockSelectedMessage;
    render(<FormMessage />);

    const cancelBtn = screen.getByRole("button", { name: /cancel edit/i });
    fireEvent.click(cancelBtn);

    // message input should be cleared after cancel
    expect(
      (screen.getByLabelText(/message/i) as HTMLTextAreaElement).value
    ).toBe("");
  });

  it("shows error toast if supabase fails", async () => {
    // make insert fail
    insertFn.mockImplementationOnce(() =>
      // @ts-expect-error: Explicitly allowing null to simulate no selected message for test
      Promise.resolve({ error: { message: "nope" } })
    );
    render(<FormMessage />);
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "fail this" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("nope", "error");
    });
  });
});
