import { Film, Images, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import type { AssetKind, BrandKit } from "@/lib/types";

/** Previzualizare demo: un vizual în culorile brandului, până generează agentul Creative imaginea reală. */
export function AssetPreview({
  brand,
  kind,
  title,
  className,
}: {
  brand: BrandKit;
  kind: AssetKind;
  title: string;
  className?: string;
}) {
  const [c1, c2, c3] = [brand.colors[0]?.hex, brand.colors[2]?.hex ?? brand.colors[1]?.hex, brand.colors[1]?.hex];
  const Icon = kind === "video" ? Film : kind === "carousel" ? Images : ImageIcon;
  return (
    <div
      className={clsx("relative flex aspect-square flex-col justify-between overflow-hidden rounded-lg p-3", className)}
      style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, color: c3 }}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider opacity-80">
        <span>{brand.logoText}</span>
        <Icon size={14} />
      </div>
      <p className="text-sm font-semibold leading-snug" style={{ fontFamily: brand.fonts.heading }}>
        {title}
      </p>
    </div>
  );
}
