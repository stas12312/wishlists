import { Card } from "@heroui/react";
import { usePress } from "react-aria";
import { IoMdAdd } from "react-icons/io";
import { twMerge } from "tailwind-merge";
const AddCardButton = ({
  onPress,
  className,
  title,
}: {
  onPress: { (): void };
  className: string;
  title: string;
}) => {
  let { pressProps, isPressed } = usePress({
    onPress: onPress,
  });
  return (
    <div className="md:hover:scale-[1.03] transition">
      <Card
        className={twMerge(
          "transition bg-background border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 z-10",
          "data-[pressed=true]:scale-95 transition",
          className,
        )}
        data-pressed={isPressed ? "true" : undefined}
      >
        <button className="cursor-pointer h-full" {...pressProps}>
          <Card.Content>
            <div className="mx-auto flex flex-col my-auto">
              <IoMdAdd className="my-auto text-4xl mx-auto" />
              <span className="">{title}</span>
            </div>
          </Card.Content>
        </button>
      </Card>
    </div>
  );
};

AddCardButton.defaultProps = {
  className: "",
};
export default AddCardButton;
