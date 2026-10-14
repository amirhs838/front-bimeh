import { AppShell } from "@/components/layout/AppShell";
import { Scroll1 } from "@/components/sections/Scroll1";
import { Scroll2 } from "@/components/sections/Scroll2";
import { Scroll3 } from "@/components/sections/Scroll3";

export default function Home() {
  return (
    <AppShell>
      <Scroll1 />
      <Scroll2 />
      <Scroll3 />
      {/* -----------------------------------------------------------
          Empty slot for the future footer (do NOT remove).
          Scroll 3 is currently the end of the page.
         ----------------------------------------------------------- */}
      <div id="footer-slot" />
    </AppShell>
  );
}
