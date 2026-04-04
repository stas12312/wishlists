import { AdminTicketDetailPage } from "@/components/admin/AdminTicketDetail";

const Page = async ({ params }: { params: Promise<{ ticket_id: number }> }) => {
  const ticketId = (await params).ticket_id;
  return <AdminTicketDetailPage ticketId={ticketId} />;
};

export default Page;
