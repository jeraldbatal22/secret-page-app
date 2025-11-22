import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Spinner } from "../ui/spinner";
import { showToast } from "@/lib/utils";

type AuthModalProps = {
  isOpen: boolean;
  onHandleToggleModal: () => void;
};

export function AuthModal({ isOpen, onHandleToggleModal }: AuthModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formInput, setFormInput] = useState({
    username: "",
    password: "",
  });

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
      onHandleToggleModal();
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
    }

    setIsLoading(false);
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setFormInput((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onHandleToggleModal}>
      <form>
        <DialogContent className=" sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Please login or register to continue</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {isLoading && <Spinner />}

            <div className="grid gap-3">
              <Label htmlFor="name-1">Username</Label>
              <Input
                id="name-1"
                name="username"
                placeholder="Please enter username"
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="Please enter password"
                onChange={handleChange}
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <>
              <Button type="button" className="flex-1" onClick={handleLogin}>
                Login
              </Button>
              <Button type="button" className="flex-1" onClick={handleRegister}>
                Register
              </Button>
            </>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
