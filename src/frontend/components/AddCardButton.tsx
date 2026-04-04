import { Card } from "@heroui/react";
import { IoMdAdd } from "react-icons/io";
const AddCardButton = ({
  onPress,
  className,
  title,
}: {
  onPress: { (): void };
  className: string;
  title: string;
}) => {
  return (
    <Card
      className={
        "md:hover:scale-[1.03] transition bg-background border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 z-10 " +
        className
      }
    >
      <button className="cursor-pointer h-full" onClick={onPress}>
        <Card.Content>
          <div className="mx-auto flex flex-col my-auto">
            <IoMdAdd className="my-auto text-4xl mx-auto" />
            <span className="">{title}</span>
          </div>
        </Card.Content>
      </button>
    </Card>
  );
};

AddCardButton.defaultProps = {
  className: "",
};
export default AddCardButton;
