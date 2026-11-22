"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare function ym(
  counterId: string,
  method: "hit" | "reachGoal",
  value: string,
): void;
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export function Metrika() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const pwaOpenSent = useRef(false);

  useEffect(() => {
    if (!YANDEX_METRIKA_ID || !isReady) {
      return;
    }
    ym(YANDEX_METRIKA_ID, "hit", window.location.href);

    const navigator = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;

    if (isStandalone && !pwaOpenSent.current) {
      ym(YANDEX_METRIKA_ID, "reachGoal", "pwa_open");
      pwaOpenSent.current = true;
    }
  }, [isReady, pathName, searchParams]);

  if (!YANDEX_METRIKA_ID) {
    return null;
  }

  return (
    <Script id="yandex-metrica" onReady={() => setIsReady(true)}>
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${YANDEX_METRIKA_ID}, "init", {
          defer: true,
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true
        });    
      `}
    </Script>
  );
}
