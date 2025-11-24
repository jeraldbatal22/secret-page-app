"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSelectedMessage } from "@/lib/slices/secret-message-silce";
import { supabaseClient } from "@/utils/supabase/client";
import { Input } from "./ui/input";
import { showToast } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Spinner } from "./ui/spinner";

const FormMessage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedMessage } = useAppSelector((state) => state.secretMessage);
  const [inputMessage, setInputMessage] = useState<string>(
    selectedMessage?.content || ""
  );
  const [messageImage, setMessageImage] = useState<File | null>(null);

  const dispatch = useAppDispatch();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (!inputMessage.trim()) return;

    try {
      const supabase = supabaseClient; // assume already instantiated

      // Upload image if present
      let imageUrl: string | null = null;
      if (messageImage) {
        imageUrl = await uploadImage(supabase, messageImage);
      }

      if (selectedMessage?.id) {
        // Update existing message
        const { error } = await supabase
          .from("messages")
          .update({ content: inputMessage.trim() })
          .eq("id", selectedMessage.id);

        if (error) throw new Error(error.message);
        setIsLoading(false);

        dispatch(setSelectedMessage(null));
        showToast("Successfully updated secret message!", "success");
      } else {
        // Insert new message
        const { error } = await supabase.from("messages").insert({
          content: inputMessage.trim(),
          sender_id: user?.id,
          image_url: imageUrl,
        });

        if (error) throw new Error(error.message);
        setIsLoading(false);
        showToast("Successfully added secret message!", "success");
      }
      setMessageImage(null);
      setInputMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save message";
      showToast(errorMessage, "error");
    }
  };

  // Helper to upload image
  const uploadImage = async (
    supabase: SupabaseClient,
    file: File
  ): Promise<string | null> => {
    const filePath = `${crypto.randomUUID()}-${file.name.replace(/\s/g, "_")}`;

    const { error } = await supabase.storage
      .from("message-images")
      .upload(filePath, file);
    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("message-images")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMessageImage(e.target.files[0]);
    }
  };

  const handleCancelEdit = () => {
    setInputMessage("");
    dispatch(setSelectedMessage(null));
  };

  useEffect(() => {
    if (selectedMessage?.content) {
      setInputMessage(selectedMessage?.content);
    }
  }, [selectedMessage?.content]);

  return (
    <section className="w-full px-4 py-8">
      <Card className=" mx-auto w-full max-w-3xl border-none bg-white/80 shadow-xl backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            Create or udpate your own secret message
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-8 ">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-linear-to-b from-slate-50 to-white/80 p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.6)]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                placeholder="Tell your story..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {!selectedMessage && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" onChange={handleFileChange}/>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={!inputMessage?.trim() || isLoading}
                className="flex-1 rounded-full py-5 text-base font-semibold relative"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    {selectedMessage?.id ? "Update" : "Save"}
                    <Send className="ml-2 size-4" />
                  </>
                )}
              </Button>

              {selectedMessage?.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full py-5 text-base font-semibold"
                  onClick={handleCancelEdit}
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default FormMessage;
