"use client";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdBolt } from "react-icons/md";

import { ActiveIcon } from "./ActiveIcon";
import Login from "./auth/Login";
import { Logo } from "./Logo";
import { UserItem } from "./user/UserProfile";

import { useHeader } from "@/providers/HeaderProviders";

export const Header = ({ isLogin }: { isLogin: boolean }) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [showBg, setShowBg] = useState(false);

  const { setVisible } = useHeader();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          setShowBg(currentScrollY > 0);
          if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
            setVisible(false);
          } else {
            setIsVisible(true);
            setVisible(true);
          }
          lastScrollY.current = currentScrollY;

          if (currentScrollY <= 100) {
            setIsVisible(true);
            setVisible(true);
          }

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
      className={clsx(
        "flex z-50 justify-between justify rounded-3xl m-2 items-center sticky top-2",
        showBg
          ? "bg-white/50 dark:bg-default/50 backdrop-blur-xl shadow-md ring-gray-500/10 ring-1 "
          : null,
        isVisible ? "opacity-100" : "opacity-0",
        "py-3 duration-400 mx-4",
      )}
    >
      <div className="w-60 shrink-0 hidden md:flex pl-4">
        <Logo />
      </div>
      <Link
        className="mx-auto text-xl flex items-center"
        color="foreground"
        href="/blog"
      >
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
