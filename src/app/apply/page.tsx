import type { Metadata } from "next";
import { ApplicationPage } from "@/components/applications/application-page";

export const metadata: Metadata = {
  title: "Apply | KTH AI Society",
  description:
    "Apply to join KTH AI Society and contribute to development, research, business, growth, or IT.",
};

export default function ApplyPage() {
  return <ApplicationPage />;
}
