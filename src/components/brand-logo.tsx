import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/gitanjali_logo.svg";
const LOGO_WIDTH = 5748;
const LOGO_HEIGHT = 862;

/** Full horizontal Gitanjali Group of Schools wordmark. */
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Gitanjali Group of Schools, Hyderabad"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      unoptimized
      className={cn("w-auto", className)}
    />
  );
}

/**
 * Square crop of the logo's emblem, for tight spots like the collapsed rail.
 * `object-cover` + `object-left` isolates the circular crest on the left.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden bg-white",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        aria-hidden
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        unoptimized
        className="h-full w-full object-cover object-left"
      />
    </span>
  );
}
