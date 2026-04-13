import Image from "next/image";
import { MapPin } from "lucide-react";

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
    <Card className="group overflow-hidden rounded-2xl border border-slate-100 bg-card shadow-md transition-all duration-300 hover:border-slate-200 hover:shadow-xl">
      {/* Imagem */}
      <div className="relative overflow-hidden rounded-t-2xl">
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

        {/* Date Chip */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-center shadow-sm backdrop-blur-sm">
          <div className="text-[15px] font-black leading-none text-slate-900">
            {event.dateChip.day}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-600">
            {event.dateChip.month}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          {/* Categoria */}
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {event.category}
          </div>

          {/* Título */}
          <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900">
            {event.title}
          </h3>

          {/* Local */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{event.locationLabel}</span>
          </div>
        </div>

        {/* Rodapé / Preço */}
        <div className="flex items-center justify-end pt-1">
          <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
            {event.priceLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}
