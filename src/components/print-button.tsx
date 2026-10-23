"use client";

import { PrinterIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function PrintButton({
  onBeforePrint,
  className,
}: {
  /** Runs just before printing, e.g. to render a full list instead of a page. */
  onBeforePrint?: () => void;
  className?: string;
}) {
  const handleClick = () => {
    if (onBeforePrint) {
      onBeforePrint();
      // Give React a frame to mount the print-only content before the dialog.
      window.setTimeout(() => window.print(), 80);
      return;
    }
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("btn-ghost no-print", className)}
    >
      <PrinterIcon className="h-4 w-4" />
      Print
    </button>
  );
}
