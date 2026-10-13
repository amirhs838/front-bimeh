import { AppShell } from "@/components/layout/AppShell";
import { Scroll1 } from "@/components/sections/Scroll1";
import { Scroll2 } from "@/components/sections/Scroll2";

export default function Home() {
  return (
    <AppShell>
      <Scroll1 />
      <Scroll2 />
      {/* -----------------------------------------------------------
          Empty slot for the future section (do NOT remove).
          Scroll 3 continues from the Scroll 2 wave using --s2-bottom-bg.
          The extra height keeps the bottom dot/curve reachable above the
          fixed chat bar at max scroll.
         ----------------------------------------------------------- */}
      <div
        id="scroll-3"
        aria-hidden
        className="h-[calc(7rem+env(safe-area-inset-bottom))]"
        style={{ background: "var(--s2-bottom-bg)" }}
      />
    </AppShell>
  );
}
