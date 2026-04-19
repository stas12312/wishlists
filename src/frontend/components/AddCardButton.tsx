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
  let { pressProps } = usePress({
    onPress: onPress,
  });
  return (
    <div
      className={twMerge(
        "rounded-3xl flex items-center cursor-pointer",
        "bg-background border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700",
        "hover:scale-[1.03] active:scale-[0.97]",
        "transition-all will-change-transform transform-gpu origin-center",
        className,
      )}
      {...pressProps}
    >
      <div className="mx-auto flex flex-col my-auto">
        <IoMdAdd className="my-auto text-4xl mx-auto" />
        <span className="">{title}</span>
      </div>
    </div>
  );
};

AddCardButton.defaultProps = {
  className: "",
};
export default AddCardButton;
