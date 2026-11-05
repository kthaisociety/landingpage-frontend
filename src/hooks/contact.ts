import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config";
import type {
  ContactMessageInput,
  ContactMessageResponse,
} from "@/types/contact";

async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageResponse> {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => null)) as
    | ContactMessageResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Couldn't send your message. Please try again.";
    throw new Error(message);
  }

  if (!data || !("status" in data)) {
    throw new Error("Couldn't send your message. Please try again.");
  }

  return data;
}

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: submitContactMessage,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
