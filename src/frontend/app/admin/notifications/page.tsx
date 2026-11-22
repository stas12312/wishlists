import PageHeader from "@/components/PageHeader";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

export default function Page() {
  return (
    <>
      <PageHeader title="Уведомления" />
      <AdminNotifications />
    </>
  );
}
