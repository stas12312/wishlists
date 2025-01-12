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
    <>
      {onlyRead ? (
        <div className="flex items-center">
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <div
                key={index}
                className={index <= (hover || value) ? "text-danger-500" : ""}
              >
                <span className={className}>
                  <IoMdHeart />
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center" onMouseLeave={() => setHover(value)}>
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <button
                key={index}
                className={index <= (hover || value) ? "text-danger-500" : ""}
                disabled={onlyRead}
                type="button"
                onClick={() => onChange(index)}
                onDoubleClick={() => onChange(0)}
                onMouseEnter={() => setHover(index)}
              >
                <span className={className}>
                  <IoMdHeart />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Desirability;
