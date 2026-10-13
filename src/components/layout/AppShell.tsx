"use client";

import { useEffect } from "react";
import { Header } from "./Header";
import { Drawer } from "./Drawer";
import { SupportSheet } from "./SupportSheet";
import { ChatSheet } from "./ChatSheet";
import { ChatBar } from "./ChatBar";
import { SelectionBar } from "./SelectionBar";
import { useSelection } from "@/lib/selection";

/**
 * Shared chrome for every page: sticky header, drawer, support/chat sheets,
 * and (optionally) the fixed chat bar + selection CTA.
 */
export function AppShell({
  children,
  showChatBar = true,
}: {
  children: React.ReactNode;
  showChatBar?: boolean;
}) {
  // rehydrate the sessionStorage-persisted selection after mount (SSR-safe)
  useEffect(() => {
    useSelection.persist.rehydrate();
  }, []);

  return (
    <>
      <Header />
      <main>{children}</main>
      {showChatBar && (
        <>
          <SelectionBar />
          <ChatBar />
        </>
      )}
      <Drawer />
      <SupportSheet />
      <ChatSheet />
    </>
  );
}
