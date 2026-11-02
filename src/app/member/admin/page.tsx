import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/components/admin/admin-sections";

// Each admin section is its own page now (see the (sections) route group);
// the bare /member/admin URL just opens the first one.
export default function MemberAdminPage() {
  redirect(ADMIN_HOME);
}
