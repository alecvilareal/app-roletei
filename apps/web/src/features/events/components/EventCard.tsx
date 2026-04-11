import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

export type Event = {
  id: string;
  title: string;
  venue: string;
  neighborhood?: string;
  dateLabel: string;
  image: {
    src: string;
    alt: string;
  };
  category: string;
  priceLabel: string;
};

type Props = {
  event: Event;
};

export function EventCard({ event }: Props) {
  return (
    <Card className="group overflow-hidden border-none bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-3">
        <div className="overflow-hidden rounded-xl">
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
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
              {event.title}
            </h3>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {event.category}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="truncate">
                {event.venue}
                {event.neighborhood ? ` • ${event.neighborhood}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span className="truncate">{event.dateLabel}</span>
              <span className="ml-auto text-xs font-medium text-foreground/80">
                {event.priceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
