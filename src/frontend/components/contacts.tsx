import { Link } from "@heroui/react";
import { MdEmail } from "react-icons/md";

export const Contacts = () => {
  const contactEmail = process.env.CONTACT_EMAIL;
  return (
    <div className="text-small text-center m-4">
      <span className="text-foreground/60">Контакты</span>
      <div className="text-foreground/50 flex gap-1 justify-center">
        <MdEmail className="my-auto" />
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
