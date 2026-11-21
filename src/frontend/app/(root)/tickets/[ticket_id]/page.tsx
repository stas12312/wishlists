import { UserTicketDetailPage } from "@/components/ticket/TicketUserDetail";

const Page = async ({ params }: { params: Promise<{ ticket_id: string }> }) => {
  const { ticket_id } = await params;
  return <UserTicketDetailPage ticketId={Number(ticket_id)} />;
};

export default Page;
