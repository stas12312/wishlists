import PageHeader from "@/components/PageHeader";
import { ParseStatusPanel } from "@/components/admin/ParseStatusPanel";

export default function Page() {
  return (
    <>
      <PageHeader title="Парсинг магазинов" />
      <ParseStatusPanel />
    </>
  );
}
