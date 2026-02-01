import Link from "next/link";
import { BsStars } from "react-icons/bs";

export const Logo = () => {
  return (
    <Link
      className="flex font-bold text-2xl gap-1 justify-center text-center items-center"
      href="/"
    >
      <BsStars style={{ color: "gold" }} />
      <p className="text-bold">MyWishlists</p>
    </Link>
  );
};
