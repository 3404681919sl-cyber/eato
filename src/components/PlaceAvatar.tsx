import type { Category } from "@/types";
import { CAT } from "@/constants";
import { resolvePlaceImage } from "@/utils/avatar";

interface PlaceAvatarProps {
  name: string;
  category: Category;
  image?: string;
  checked?: boolean;
  visitIndex?: number;
}

export default function PlaceAvatar({ name, category, image, checked, visitIndex }: PlaceAvatarProps) {
  const cat = CAT[category] ?? CAT.other;

  return (
    <div className="relative flex-shrink-0">
      <img
        src={resolvePlaceImage(name, category, image)}
        alt={name}
        className={`w-12 h-12 rounded-xl object-cover bg-muted ${checked ? "grayscale" : ""}`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${cat.light}"/><text x="50" y="64" font-size="50" text-anchor="middle">${cat.emoji}</text></svg>`
          )}`;
        }}
      />
      {visitIndex !== undefined && visitIndex > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{ backgroundColor: cat.color }}
        >
          #{visitIndex + 1}
        </span>
      )}
    </div>
  );
}
