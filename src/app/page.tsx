import { AppShell } from "@/components/layout/AppShell";
import { Scroll1 } from "@/components/sections/Scroll1";

export default function Home() {
  return (
    <AppShell>
      <Scroll1 />
      {/* -----------------------------------------------------------
          Empty slots for future sections (do NOT remove).
          Scroll 2 & 3 components render into these anchors without
          touching Scroll 1.
         ----------------------------------------------------------- */}
      <div id="scroll-2" aria-hidden />
      <div id="scroll-3" aria-hidden />
    </AppShell>
  );
}
