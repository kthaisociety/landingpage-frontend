import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/config";
import type {
  CreateNewsletterSubscriptionInput,
  CreateNewsletterSubscriptionResponse,
} from "@/types/newsletter";

async function submitNewsletterSubscription(
  input: CreateNewsletterSubscriptionInput,
): Promise<CreateNewsletterSubscriptionResponse> {
  const response = await fetch(`${API_URL}/newsletter/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      gender: input.gender,
      university: input.university.trim(),
      programme: input.programme.trim(),
      graduationYear: input.graduationYear,
      interests: input.interests,
      dataRetentionConsent: input.dataRetentionConsent,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | CreateNewsletterSubscriptionResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Failed to subscribe to the newsletter";
    throw new Error(message);
  }

  return data as CreateNewsletterSubscriptionResponse;
}

export function useSubmitNewsletterSubscription() {
  return useMutation({
    mutationFn: submitNewsletterSubscription,
  });
}
