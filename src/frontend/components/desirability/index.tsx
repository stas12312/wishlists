import { useState } from "react";
import { IoMdHeart } from "react-icons/io";

export const Desirability = ({
  value,
  onChange = () => {},
  onlyRead = false,
  size = "md",
}: {
  value: number;
  onChange?: { (value: number): void };
  onlyRead?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const [hover, setHover] = useState(0);
  let className = "";
  switch (size) {
    case "sm":
      break;
    case "md":
      className = "text-medium";
      break;
    case "lg":
      className = "text-2xl";
      break;
  }
  return (
    <div className="flex items-center">
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <button
            key={index}
            className={index <= (hover || value) ? "text-danger-500" : ""}
            disabled={onlyRead}
            type="button"
            onClick={() => {
              onlyRead ? null : onChange(index);
            }}
            onDoubleClick={() => {
              onlyRead ? null : onChange(0);
            }}
            onMouseEnter={() => {
              onlyRead ? null : setHover(index);
            }}
          >
            <span className={className}>
              <IoMdHeart />
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Desirability;
