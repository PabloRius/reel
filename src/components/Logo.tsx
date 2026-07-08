import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold text-lg">
      <span className="grid place-items-center w-8 h-8 rounded-lg btn-gradient text-white">
        🎬
      </span>
      <span className="gradient-text tracking-tight">Reel</span>
    </Link>
  );
}
