import { notFound } from "next/navigation";
import { PublicMemberProfileMock } from "@/components/member/public-member-profile-mock";
import { getResolvedMockMemberProfileBySlug } from "@/lib/data/member-profiles";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = getResolvedMockMemberProfileBySlug(id);

  if (!profile) {
    notFound();
  }

  return <PublicMemberProfileMock profile={profile} />;
}