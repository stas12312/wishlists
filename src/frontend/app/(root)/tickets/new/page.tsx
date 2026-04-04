import { CustomBreadcrumbs } from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { CreateTicketForm } from "@/components/ticket/TicketForm";

export default function Page() {
  return (
    <>
      <PageHeader>
        <CustomBreadcrumbs
          items={[
            {
              title: "Поддержка",
              href: "/tickets",
            },
            {
              title: "Новое обращение",
              href: `/tickets/add`,
            },
          ]}
        />
      </PageHeader>
      <CreateTicketForm />
    </>
  );
}
