import type { ApplicationGender, ApplicationInterest } from "@/types/applications";

export type CreateNewsletterSubscriptionInput = {
  firstName: string;
  lastName: string;
  email: string;
  gender: ApplicationGender;
  university: string;
  programme: string;
  graduationYear: number;
  interests: ApplicationInterest[];
  dataRetentionConsent: boolean;
};

export type CreateNewsletterSubscriptionResponse = {
  status: string;
};
