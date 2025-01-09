import { Link } from "@nextui-org/link";
import { MdEmail } from "react-icons/md";

export const Contacts = () => {
  const contactEmail = process.env.CONTACT_EMAIL;
  return (
    <div className="text-small text-center m-4">
      <span className="text-default-600">Контакты</span>
      <div className="text-default-500 flex gap-1 justify-center">
        <MdEmail className="my-auto" />
        <Link
          className="text-default-500"
          href={`mailto:${contactEmail}`}
          size="sm"
        >
          {contactEmail}
        </Link>
      </div>
    </div>
  );
};
