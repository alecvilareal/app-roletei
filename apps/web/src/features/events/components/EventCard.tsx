import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

export type Event = {
  id: string;
  title: string;
  venue: string;
  neighborhood?: string;
  dateLabel: string; // ex: "Sex, 19:00"
  dateChip: {
    day: string; // ex: "11"
    month: string; // ex: "ABR"
  };
  image: {
    src: string;
    alt: string;
  };
  category: string;
  priceLabel: string; // ex: "A partir de R$ 35"
  distanceLabel: string; // ex: "Savassi • 2km"
};

type Props = {
  event: Event;
};

export function EventCard({ event }: Props) {
  return (
    <Card className="group overflow-hidden border-none bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={event.image.src}
              alt={event.image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          </AspectRatio>

          {/* Floating Date Chip */}
          <div className="absolute left-3 top-3 rounded-xl bg-background/90 px-2.5 py-2 text-center shadow-sm backdrop-blur">
            <div className="text-sm font-bold leading-none text-foreground">
              {event.dateChip.day}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
              {event.dateChip.month}
            </div>
          </div>

          {/* Category */}
          <div className="absolute right-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background shadow-sm backdrop-blur">
            {event.category}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
            {event.title}
          </h3>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
              <span className="truncate">
                {event.venue}
                {event.neighborhood ? ` • ${event.neighborhood}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
              <span className="truncate">{event.dateLabel}</span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-sm font-medium text-foreground/90">
                {event.priceLabel}
              </span>
              <span className="text-sm">{event.distanceLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
