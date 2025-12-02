import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "./auth-form";

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("AuthForm", () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  // Remove beforeEach cleanup for consoleSpy
  it("renders the form with all required fields", () => {
    render(<AuthForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByText(/Sign In to Your Account/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  it("renders email input with correct placeholder", () => {
    render(<AuthForm />);
    // const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    const emailInput = screen.getByTestId("input-email");
    // Extract the placeholder text and trim any extra whitespace
    const placeholderValue = emailInput?.getAttribute("placeholder")?.trim();

    expect(placeholderValue).toMatch(/enter your email address/i);

    // Check type
    expect(emailInput).toHaveAttribute("type", "email");

    // Check test-id
    expect(emailInput).toHaveAttribute("data-testid", "input-email");
  });

  it("renders password input with correct placeholder", () => {
    render(<AuthForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("allows user to type in email field", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("allows user to type in password field", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows validation error when email is invalid", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when password is too short", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data and does not show validation errors", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/valid email required/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  it("does not submit form when validation for email is fail", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "invalid email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/valid email required/i)).toBeInTheDocument();
    });
  });

  it("does not submit form when validation for password is fail", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(passwordInput, "pass");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("clears validation errors when user corrects input", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Step 1: Trigger validation error by entering invalid email and submitting
    await user.type(emailInput, "invalid");
    await user.type(passwordInput, "1234");
    await user.click(submitButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });

    // Step 2: Fix the input by clearing and entering valid email
    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");
    await user.type(passwordInput, "1234567");

    // Step 3: Verify error message disappears
    // queryByText is used here because we're checking for absence
    // It returns null if not found, which is what we want
    await waitFor(() => {
      expect(
        screen.queryByText(/valid email required/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i)
      ).not.toBeInTheDocument();
    });
  });
});
