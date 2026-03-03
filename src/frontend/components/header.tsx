"use client";
import Link from "next/link";
import { MdBolt } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

import { Logo } from "./logo";
import { ActiveIcon } from "./activeIcon";
import { UserItem } from "./user";
import Login from "./login";

export const Header = ({ isLogin }: { isLogin: boolean }) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          console.log(currentScrollY);

          if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }

          if (currentScrollY <= 100) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`flex z-50 justify-between justify rounded-2xl bg-content1/50 m-2 shadow-medium items-center sticky top-2 backdrop-blur-xl py-3 ${isVisible ? "opacity-100" : "opacity-0"} duration-200`}
    >
      <div className="w-60 shrink-0 hidden items-center md:flex justify-center">
        <Logo />
      </div>
      <Link className="mx-auto text-xl flex" color="foreground" href="/blog">
        <ActiveIcon
          activeClassName="text-yellow-500"
          className=""
          icon={<MdBolt />}
          path="/blog"
        />
        <p>Блог</p>
      </Link>
      <div className="gap-4 px-4 flex justify-between md:justify-end">
        {isLogin ? <UserItem /> : <Login />}
      </div>
    </header>
  );
};
