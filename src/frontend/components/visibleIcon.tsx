import { Tooltip } from "@heroui/tooltip";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

export const enum Visible {
  private = 0,
  all = 1,
  friends = 2,
  selected_users = 3,
}

const visibleData = [
  {
    text: "Доступен только мне",
    icon: <MdOutlinePublicOff />,
  },
  {
    text: "Доступен всем",
    icon: <MdOutlinePublic />,
  },
  {
    text: "Доступен друзьям",
    icon: <MdPerson />,
  },
  {
    text: "Доступен указанным друзьям",
    icon: <MdPerson />,
  },
];

export function VisibleStatus({ visible }: { visible: Visible }) {
  const data = visibleData[visible];

  return (
    <Tooltip closeDelay={100} content={data.text}>
      {data.icon}
    </Tooltip>
  );
}
