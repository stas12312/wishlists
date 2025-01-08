import { Tooltip } from "@nextui-org/tooltip";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

const visibleData = {
  0: {
    text: "Доступен только мне",
    icon: <MdOutlinePublicOff />,
  },
  1: {
    text: "Доступен всем",
    icon: <MdOutlinePublic />,
  },
  2: {
    text: "Доступен друзьям",
    icon: <MdPerson />,
  },
};

export function VisibleStatus({ visible }: { visible: 0 | 1 | 2 }) {
  const data = visibleData[visible];

  return (
    <Tooltip closeDelay={100} content={data.text}>
      {data.icon}
    </Tooltip>
  );
}

