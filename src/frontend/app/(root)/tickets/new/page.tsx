import { CustomBreadcrumbs } from "@/components/breadcrumbs";
import PageHeader from "@/components/pageHeader";
import { CreateTicketForm } from "@/components/tickets/form";

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
