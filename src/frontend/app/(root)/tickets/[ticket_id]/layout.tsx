import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}): Promise<Metadata> {
  const ticketId = (await params).ticket_id;

  return {
    title: `Обращение #${ticketId}`,
    openGraph: {
      title: `Обращение #${ticketId}`,
      description: `Обращение #${ticketId}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
