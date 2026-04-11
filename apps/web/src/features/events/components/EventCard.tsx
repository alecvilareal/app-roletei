import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

export type Event = {
  id: string;
  title: string;
  locationLabel: string; // ex: "Arena MRV • Belo Horizonte"
  dateChip: {
    day: string; // ex: "11"
    month: string; // ex: "ABR"
  };
  image: {
    src: string;
    alt: string;
  };
  priceLabel: string; // ex: "A partir de R$ 50,00" | "Grátis"
  category: string;
};

type Props = {
  event: Event;
};

export function EventCard({ event }: Props) {
  return (
    <Card className="group overflow-hidden border-none bg-card shadow-md transition-shadow duration-200 hover:shadow-xl">
      {/* Image */}
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={event.image.src}
            alt={event.image.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        </AspectRatio>

        {/* Date chip - bottom-left on image */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-background px-2.5 py-2 text-center shadow-md">
          <div className="text-sm font-extrabold leading-none text-foreground">
            {event.dateChip.day}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
            {event.dateChip.month}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            {event.category}
          </div>

          <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-foreground">
            {event.title}
          </h3>

          <div className="text-sm text-muted-foreground">{event.locationLabel}</div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Preço</span>
          <span className="text-sm font-semibold text-[hsl(var(--primary))]">
            {event.priceLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}
