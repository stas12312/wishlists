import { redirect } from "next/navigation";

import { AdminMenuItems } from "@/components/admin/adminMenuItems";

export default function Page() {
  redirect(AdminMenuItems[0].href);
}
