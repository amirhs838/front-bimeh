import { SubPageShell } from "@/components/layout/SubPageShell";

/**
 * Shared stub page for footer routes that are not built yet:
 * same Header/back row chrome, Persian title + one coming-soon line.
 */
export function StubPage({ title }: { title: string }) {
  return (
    <SubPageShell title={title}>
      <div className="flex flex-col items-center rounded-2xl border border-white/90 bg-white/72 p-8 text-center shadow-[0_2px_12px_rgba(70,90,140,0.06)] backdrop-blur-[3px]">
        <p className="text-[0.8125rem] leading-7 text-[#5a6474]">
          این صفحه به‌زودی تکمیل می‌شود.
        </p>
      </div>
    </SubPageShell>
  );
}
