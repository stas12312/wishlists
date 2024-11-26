import { Tooltip } from "@nextui-org/tooltip";
import { MdOutlinePublic, MdOutlinePublicOff } from "react-icons/md";

export function VisibleStatus(props: { visible: number }) {
  return (
    <Tooltip
      closeDelay={100}
      content={props.visible == 0 ? "Доступен только мне" : "Доступен всем"}
    >
      {props.visible == 0 ? <MdOutlinePublicOff /> : <MdOutlinePublic />}
    </Tooltip>
  );
}
