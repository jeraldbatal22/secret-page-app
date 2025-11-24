import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseClient } from "@/utils/supabase/client";
import { showToast } from "@/lib/utils";

// Zod schema for form
const authSchema = z.object({
  username: z
    .email({ message: "Valid email required" })
    .trim()
    .min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthInput = z.infer<typeof authSchema>;

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const form = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const { setError } = form;

  const onLogin = async (data: AuthInput) => {
    setIsLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: data.username,
      password: data.password,
    });

    if (error) {
      showToast(error.message, "error");
      if (error?.message?.toLowerCase().includes("email")) {
        setError("username", { message: "Invalid email or password" });
      } else {
        setError("password", { message: error.message });
      }
    } else {
      router.push("/secret-page-1");
    }
    setIsLoading(false);
  };

  const onRegister = async (data: AuthInput) => {
    setIsLoading(true);
    const { error } = await supabaseClient.auth.signUp({
      email: data.username.trim(),
      password: data.password.trim(),
    });

    if (error) {
      showToast(error.message, "error");
      setError("username", { message: error.message });
    } else {
      showToast(
        "Registration successful! Please check your email to confirm your account before logging in.",
        "success"
      );
      setActiveTab("login");
      form.reset({ username: data.username, password: "" });
    }
    setIsLoading(false);
  };

  // React Hook Form does not use browser validation, so just return false for HTML form submit
  const noop = (e: React.FormEvent) => e.preventDefault();

  return (
    <Form {...form}>
      <form
        className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full mx-auto p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-8"
        onSubmit={noop}
        autoComplete="off"
      >
        {/* Tab Selector */}
        <div className="flex mb-2">
          <Button
            variant="ghost"
            className={`flex-1 py-2 rounded-t-lg font-medium transition-colors duration-150 ${
              activeTab === "login"
                ? "bg-violet-50 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 shadow"
                : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
            type="button"
            onClick={() => setActiveTab("login")}
            disabled={isLoading}
          >
            Login
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 py-2 rounded-t-lg font-medium transition-colors duration-150 ${
              activeTab === "register"
                ? "bg-violet-50 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 shadow"
                : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
            type="button"
            onClick={() => setActiveTab("register")}
            disabled={isLoading}
          >
            Register
          </Button>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-center text-gradient bg-linear-to-r from-violet-700 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent mb-3">
          {activeTab === "login"
            ? "Sign In to Your Account"
            : "Register an Account"}
        </h2>
        {isLoading && (
          <div className="flex justify-center my-2">
            <Spinner />
          </div>
        )}

        <div className="grid gap-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="username" className="text-base">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    autoFocus
                    autoComplete="username"
                    placeholder="Enter your email address"
                    type="email"
                    inputMode="email"
                    className="font-medium"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel htmlFor="password" className="text-base">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    className=" font-medium"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full text-base py-2"
            onClick={form.handleSubmit(
              activeTab === "login" ? onLogin : onRegister
            )}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
