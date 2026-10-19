import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact | KTH AI Society",
  description:
    "Get in touch with KTH AI Society. Choose a team and we will route your message to the right inbox.",
};

export default function Page() {
  return <ContactPage />;
}
