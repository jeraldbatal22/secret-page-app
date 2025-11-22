import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Spinner } from "../ui/spinner";
import { showToast } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export function AuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formInput, setFormInput] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabaseClient().auth.signInWithPassword({
      email: formInput.username,
      password: formInput.password,
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      router.push("/secret-page-1");
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);

    const { error } = await supabaseClient().auth.signUp({
      email: formInput.username.trim(),
      password: formInput.password.trim(),
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast(
        "Registration successful! Please check your email to confirm your account before logging in.",
        "success"
      );
      setActiveTab("login");
    }

    setIsLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setFormInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Improved form validation
  const isFormValid =
    formInput.username.trim().length > 0 && formInput.password.length > 0;

  return (
    <form
      className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full mx-auto p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-8"
      onSubmit={e => e.preventDefault()}
      autoComplete="off"
    >
      {/* Tab Selector */}
      <div className="flex mb-2">
        <button
          className={`flex-1 py-2 rounded-t-lg font-medium transition-colors duration-150 ${
            activeTab === "login"
              ? "bg-violet-50 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 shadow"
              : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
          type="button"
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 rounded-t-lg font-medium transition-colors duration-150 ${
            activeTab === "register"
              ? "bg-violet-50 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 shadow"
              : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
          type="button"
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>
      <h2 className="text-2xl font-extrabold text-center text-gradient bg-linear-to-r from-violet-700 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent mb-3">
        {activeTab === "login" ? "Sign In to Your Account" : "Create an Account"}
      </h2>
      {isLoading && (
        <div className="flex justify-center my-2">
          <Spinner />
        </div>
      )}

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="auth-username" className="text-base">
            Email
          </Label>
          <Input
            autoFocus
            id="auth-username"
            name="username"
            autoComplete="username"
            placeholder="name@example.com"
            type="email"
            inputMode="email"
            disabled={isLoading}
            value={formInput.username}
            onChange={handleChange}
            className="font-medium"
          />
        </div>
        <div className="grid gap-2 relative">
          <Label htmlFor="auth-password" className="text-base">
            Password
          </Label>
          <Input
            id="auth-password"
            name="password"
            placeholder="••••••••"
            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            value={formInput.password}
            minLength={6}
            disabled={isLoading}
            className="pr-10 font-medium"
          />
          {/* Toggle password visibility */}
          <button
            type="button"
            tabIndex={-1}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition p-1 bg-transparent"
            onClick={() => setShowPassword((show) => !show)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {activeTab === "login" ? (
          <Button
            type="submit"
            className="w-full text-base py-2"
            onClick={handleLogin}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        ) : (
          <Button
            type="submit"
            className="w-full text-base py-2"
            variant="outline"
            onClick={handleRegister}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        )}
        <div className="text-sm text-center mt-1">
          {activeTab === "login" ? (
            <span>
              Don&apos;t have an account?{" "}
              <button
                className="text-violet-700 dark:text-violet-400 hover:underline font-semibold"
                type="button"
                onClick={() => setActiveTab("register")}
                disabled={isLoading}
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                className="text-violet-700 dark:text-violet-400 hover:underline font-semibold"
                type="button"
                onClick={() => setActiveTab("login")}
                disabled={isLoading}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
