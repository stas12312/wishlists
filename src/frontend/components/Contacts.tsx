import { Link } from "@heroui/react";
import { MdContacts } from "react-icons/md";

export const Contacts = () => {
  const contactEmail = process.env.CONTACT_EMAIL;
  return (
    <div className="text-small text-center">
      <span className="text-foreground/60 flex gap-1 items-center justify-center">
        <MdContacts />
        Контакты
      </span>
      <div className="text-foreground/50 flex gap-1 justify-center">
        <Link
          className="text-foreground/50 no-underline"
          href={`mailto:${contactEmail}`}
        >
          {contactEmail}
        </Link>
      </div>
    </div>
  );
};
