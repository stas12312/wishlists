import { UserTicketDetailPage } from "@/components/tickets/user-ticket-detail";

const Page = async ({ params }: { params: Promise<{ ticket_id: number }> }) => {
  const ticketId = (await params).ticket_id;
  return <UserTicketDetailPage ticketId={ticketId} />;
};

export default Page;
