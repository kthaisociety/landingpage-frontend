"use client";

import { useParams } from "next/navigation";
import { TeamQuestionsForm } from "@/components/applications/team-questions-form";

export default function TeamQuestionsPage() {
  const params = useParams();
  const token = params.token as string;

  return (
    <main className="min-h-screen bg-white px-4 pt-24 text-secondary-black sm:px-6">
      <TeamQuestionsForm token={token} />
    </main>
  );
}
