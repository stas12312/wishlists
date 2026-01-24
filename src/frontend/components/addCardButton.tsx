import { Card, CardBody } from "@heroui/card";
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
      isPressable
      className={
        "md:hover:scale-[1.03] bg-background border-1 border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 z-10 " +
        className
      }
      onPress={onPress}
    >
      <CardBody>
        <div className="mx-auto flex flex-col my-auto">
          <IoMdAdd className="my-auto text-4xl mx-auto" />
          <span className="">{title}</span>
        </div>
      </CardBody>
    </Card>
  );
};

AddCardButton.defaultProps = {
  className: "",
};
export default AddCardButton;
