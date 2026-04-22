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
  } | null;
  priceLabel: string; // ex: "A partir de R$ 50,00" | "Grátis"
  category: string;

  // etiquetas (ex: estilos musicais)
  tags?: string[];
};

type Props = {
  event: Event;
};

function removeCepFromAddress(address: string) {
  // Remove CEP do formato 00000-000 ou 00000000 (com ou sem separadores)
  return address
    .replace(/\b\d{5}-\d{3}\b/g, "")
    .replace(/\b\d{8}\b/g, "")
    .replace(/\s+-\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+-\s+$/g, "")
    .trim();
}

function splitLocationLabel(locationLabel: string) {
  // Esperado: "Nome • Endereço completo"
  const [placeNameRaw, ...rest] = locationLabel.split("•");
  const placeName = (placeNameRaw ?? "").trim();
  const fullAddressRaw = rest.join("•").trim();
  const fullAddress = removeCepFromAddress(fullAddressRaw);
  return { placeName, fullAddress };
}

export function EventCard({ event }: Props) {
  const hasBanner = Boolean(event.image?.src);
  const { placeName, fullAddress } = splitLocationLabel(event.locationLabel);

  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-100 bg-card shadow-md transition-all duration-300 hover:border-slate-200 hover:shadow-xl">
      {hasBanner ? (
        <>
          {/* Imagem */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <AspectRatio ratio={16 / 9} className="block leading-none">
              <Image
                src={event.image!.src}
                alt={event.image!.alt}
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

              {/* Tags (ex: Estilo musical) */}
              {(event.tags ?? []).length ? (
                <div className="flex flex-wrap gap-2">
                  {(event.tags ?? []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#F58318]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#F58318]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

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
        </>
      ) : (
        <div className="relative flex min-h-[220px] flex-col justify-between p-5">
          {/* Date Chip */}
          <div className="absolute right-4 top-4 rounded-xl bg-slate-900 px-3 py-2 text-center shadow-sm">
            <div className="text-[15px] font-black leading-none text-white">{event.dateChip.day}</div>
            <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-white/80">
              {event.dateChip.month}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {event.category}
            </div>

            <h3 className="text-xl font-black leading-snug tracking-tight text-slate-900">
              {event.title}
            </h3>

            {/* Tags (ex: Estilo musical) */}
            {(event.tags ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {(event.tags ?? []).slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#F58318]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#F58318]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="space-y-1.5 rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
                <span className="line-clamp-1">{placeName || event.locationLabel}</span>
              </div>

              {fullAddress ? (
                <div className="pl-6 text-xs text-slate-600">{fullAddress}</div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
              {event.priceLabel}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
