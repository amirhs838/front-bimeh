"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Shared Radix-based sheet primitives used by Drawer / SupportSheet / ChatSheet. */

export const SheetRoot = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-[rgba(23,28,42,0.4)] backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

export function SheetPortal(props: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        dir="rtl"
        className={cn(
          "fixed z-50 bg-white outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={className} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={className} {...props} />;
}

/** Round soft close button used in sheet headers. */
export function SheetCloseButton({ label, className }: { label: string; className?: string }) {
  return (
    <SheetClose
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1f6] text-[#3c4654] transition-colors hover:bg-[#e3e8f0]",
        className
      )}
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <path
          d="M2 2l10 10M12 2 2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </SheetClose>
  );
}
