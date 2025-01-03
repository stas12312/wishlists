import { Card, CardBody } from "@nextui-org/card";
import { IoMdAdd } from "react-icons/io";
const AddCardButton = ({
  onPress,
  className,
}: {
  onPress: { (): void };
  className: string;
}) => {
  return (
    <Card
      className={
        "md:hover:scale-[1.03] bg-transparent border-1 border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 " +
        className
      }
      isPressable
      onPress={onPress}
    >
      <CardBody>
        <div className="mx-auto flex my-auto">
          <IoMdAdd className="my-auto text-4xl" />
        </div>
      </CardBody>
    </Card>
  );
};

AddCardButton.defaultProps = {
  className: "",
};
export default AddCardButton;

