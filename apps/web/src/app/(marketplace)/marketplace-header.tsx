"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { Input } from "@/components/ui/input";
import { useEventSearch } from "@/hooks/useEventSearch";

const DEFAULT_STATE_UF = "MG";

const DEFAULT_CITY = {
  city: "Belo Horizonte",
  state: DEFAULT_STATE_UF,
};

const BRAZIL_STATES = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
] as const;

type LocationSelection =
  | {
      mode: "city";
      city: string;
      state: string;
      label: string;
    }
  | {
      mode: "zip";
      zip: string;
      city: string;
      state: string;
      label: string;
    }
  | {
      mode: "geo";
      lat: number;
      lng: number;
      city: string;
      state: string;
      label: string;
    };

type IbgeMunicipality = {
  id: number;
  nome: string;
};

type LocationDetails = {
  city: string;
  state: string;
};

type ViaCepResponse = {
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

type NominatimReverseResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
  };
};

function formatLocationLabel(city: string, state: string) {
  return `${city}, ${state}`;
}

function getCityFromAddress(address?: NominatimReverseResponse["address"]) {
  return (
    address?.city?.trim() ||
    address?.town?.trim() ||
    address?.village?.trim() ||
    address?.municipality?.trim() ||
    address?.county?.trim() ||
    ""
  );
}

function getStateUfFromName(stateName: string) {
  const normalized = normalizeText(stateName);

  return (
    BRAZIL_STATES.find(([, fullName]) => normalizeText(fullName) === normalized)?.[0] ?? stateName.trim()
  );
}

function getStateFromAddress(address?: NominatimReverseResponse["address"]) {
  const stateName = address?.state?.trim() || "";
  if (!stateName) return "";
  return getStateUfFromName(stateName);
}

async function lookupCepLocation(rawCep: string): Promise<LocationDetails> {
  const digits = rawCep.replace(/\D/g, "");

  if (digits.length !== 8) {
    throw new Error("Informe um CEP válido com 8 dígitos.");
  }

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!res.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = (await res.json()) as ViaCepResponse;

  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  const city = data.localidade?.trim();
  const state = data.uf?.trim();

  if (!city || !state) {
    throw new Error("Não foi possível identificar cidade e estado do CEP.");
  }

  return { city, state };
}

async function lookupReverseGeocodeLocation(lat: number, lng: number): Promise<LocationDetails> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error("Não foi possível consultar sua localização.");
  }

  const data = (await res.json()) as NominatimReverseResponse;
  const city = getCityFromAddress(data.address);
  const state = getStateFromAddress(data.address);

  if (!city || !state) {
    throw new Error("Não foi possível identificar cidade e estado.");
  }

  return { city, state };
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getStateName(uf: string) {
  return BRAZIL_STATES.find(([code]) => code === uf)?.[1] ?? uf;
}

function resolveLocationSelection(searchParams: URLSearchParams): LocationSelection {
  const mode = searchParams.get("locationMode");

  if (mode === "city") {
    const city = searchParams.get("locationCity")?.trim() || DEFAULT_CITY.city;
    const state = searchParams.get("locationState")?.trim() || DEFAULT_CITY.state;

    return {
      mode: "city",
      city,
      state,
      label: formatLocationLabel(city, state),
    };
  }

  if (mode === "zip") {
    const zip = formatCep(searchParams.get("locationZip") ?? "");
    const city = searchParams.get("locationCity")?.trim() || "";
    const state = searchParams.get("locationState")?.trim() || "";

    return {
      mode: "zip",
      zip,
      city,
      state,
      label: city && state ? formatLocationLabel(city, state) : zip ? `CEP ${zip}` : "Digite um CEP",
    };
  }

  if (mode === "geo") {
    const lat = Number(searchParams.get("locationLat"));
    const lng = Number(searchParams.get("locationLng"));
    const city = searchParams.get("locationCity")?.trim() || "";
    const state = searchParams.get("locationState")?.trim() || "";

    return {
      mode: "geo",
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      city,
      state,
      label: city && state ? formatLocationLabel(city, state) : "Minha localização",
    };
  }

  return {
    mode: "city",
    city: DEFAULT_CITY.city,
    state: DEFAULT_CITY.state,
    label: formatLocationLabel(DEFAULT_CITY.city, DEFAULT_CITY.state),
  };
}

function applyLocationSelection(params: URLSearchParams, selection: LocationSelection) {
  params.delete("locationMode");
  params.delete("locationCity");
  params.delete("locationState");
  params.delete("locationZip");
  params.delete("locationLat");
  params.delete("locationLng");

  if (selection.mode === "city") {
    params.set("locationMode", "city");
    params.set("locationCity", selection.city);
    params.set("locationState", selection.state);
    return;
  }

  if (selection.mode === "zip") {
    params.set("locationMode", "zip");
    params.set("locationZip", selection.zip.replace(/\D/g, ""));
    params.set("locationCity", selection.city);
    params.set("locationState", selection.state);
    return;
  }

  params.set("locationMode", "geo");
  params.set("locationLat", selection.lat.toFixed(6));
  params.set("locationLng", selection.lng.toFixed(6));
  params.set("locationCity", selection.city);
  params.set("locationState", selection.state);
}

function HeaderLinks() {
  return (
    <div className="flex items-center gap-4">
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Como funciona
      </a>
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Quem somos
      </a>
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Ajuda
      </a>
    </div>
  );
}

export function MarketplaceHeader() {
  const search = useEventSearch({ debounceMs: 300, limit: 8 });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const locationButtonRef = useRef<HTMLButtonElement | null>(null);
  const locationPanelRef = useRef<HTMLDivElement | null>(null);
  const stateButtonRef = useRef<HTMLButtonElement | null>(null);
  const stateDropdownRef = useRef<HTMLDivElement | null>(null);
  const citiesCacheRef = useRef<Record<string, string[]>>({});
  const citiesRequestIdRef = useRef(0);

  const [locationOpen, setLocationOpen] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [selectedStateUf, setSelectedStateUf] = useState(DEFAULT_STATE_UF);
  const [cityQuery, setCityQuery] = useState("");
  const [cityInputTouched, setCityInputTouched] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [zipDraft, setZipDraft] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const autoLocationAttemptRef = useRef(false);

  const currentLocation = useMemo(
    () => resolveLocationSelection(new URLSearchParams(searchParamsString)),
    [searchParamsString],
  );

  const filteredCityOptions = useMemo(() => {
    const query = normalizeText(cityQuery);
    if (!cityOptions.length) return [];
    if (!query) return cityOptions.slice(0, 8);
    return cityOptions.filter((city) => normalizeText(city).includes(query)).slice(0, 8);
  }, [cityOptions, cityQuery]);

  const syncLocationInUrl = useCallback(
    (nextLocation: LocationSelection, options?: { push?: boolean }) => {
      const nextParams = new URLSearchParams(searchParamsString);
      applyLocationSelection(nextParams, nextLocation);

      const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

      if (options?.push) {
        router.push(nextUrl);
        return;
      }

      router.replace(nextUrl);
    },
    [pathname, router, searchParamsString],
  );

  function handleToggleStateDropdown() {
    setStateDropdownOpen((open) => !open);
    setCityInputTouched(false);
  }

  async function loadCitiesForState(uf: string) {
    const cached = citiesCacheRef.current[uf];
    if (cached) {
      setCityOptions(cached);
      setCitiesLoading(false);
      setCitiesError(null);
      return cached;
    }

    const requestId = ++citiesRequestIdRef.current;
    setCitiesLoading(true);
    setCitiesError(null);

    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      );

      if (!res.ok) {
        throw new Error("Não foi possível carregar as cidades.");
      }

      const data = (await res.json()) as IbgeMunicipality[];
      const nextCities = Array.isArray(data)
        ? data.map((city) => city?.nome?.trim()).filter((city): city is string => Boolean(city))
        : [];

      if (citiesRequestIdRef.current !== requestId) return nextCities;

      citiesCacheRef.current[uf] = nextCities;
      setCityOptions(nextCities);
      return nextCities;
    } catch (e) {
      if (citiesRequestIdRef.current !== requestId) return [];

      const message = e instanceof Error ? e.message : "Não foi possível carregar as cidades.";

      setCityOptions([]);
      setCitiesError(message);
      return [];
    } finally {
      if (citiesRequestIdRef.current === requestId) {
        setCitiesLoading(false);
      }
    }
  }

  function handleOpenLocationPanel() {
    const nextState =
      currentLocation.state || selectedStateUf || DEFAULT_STATE_UF;

    setSelectedStateUf(nextState);
    setStateDropdownOpen(false);
    setCityQuery(currentLocation.city || "");
    setZipDraft(currentLocation.mode === "zip" ? currentLocation.zip : "");
    setCityInputTouched(false);
    setCityError(null);
    setZipError(null);
    setGeoError(null);

    setLocationOpen((open) => {
      const nextOpen = !open;
      if (nextOpen) void loadCitiesForState(nextState);
      return nextOpen;
    });
  }

  function handleStateChange(nextUf: string) {
    setSelectedStateUf(nextUf);
    setStateDropdownOpen(false);
    setCityQuery("");
    setCityInputTouched(true);
    setCityError(null);
    setCitiesError(null);
    void loadCitiesForState(nextUf);
  }

  function handleSelectCity(city: string) {
    const cityName = city.trim();
    if (!cityName) return;

    setCityError(null);
    setStateDropdownOpen(false);
    setLocationOpen(false);
    setCityInputTouched(false);
    setCityQuery(cityName);

    syncLocationInUrl({
      mode: "city",
      city: cityName,
      state: selectedStateUf,
      label: formatLocationLabel(cityName, selectedStateUf),
    });
  }

  function handleCityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const query = normalizeText(cityQuery);
    if (!query) {
      setCityError("Digite o nome de uma cidade.");
      return;
    }

    const exactMatch =
      cityOptions.find((city) => normalizeText(city) === query) ??
      cityOptions.find((city) => normalizeText(city).includes(query));

    if (!exactMatch) {
      setCityError("Selecione uma cidade válida para o estado escolhido.");
      return;
    }

    handleSelectCity(exactMatch);
  }

  function goToSearchResults() {
    const q = search.query.trim();
    const nextParams = new URLSearchParams(searchParamsString);

    applyLocationSelection(nextParams, currentLocation);

    if (q) {
      nextParams.set("q", q);
    } else {
      nextParams.delete("q");
    }

    if (!q && !nextParams.toString()) return;

    router.push(`/busca?${nextParams.toString()}`);
  }

  async function handleApplyZip() {
    const digits = zipDraft.replace(/\D/g, "").slice(0, 8);

    if (digits.length !== 8) {
      setZipError("Informe um CEP válido com 8 dígitos.");
      return;
    }

    setZipLoading(true);
    setZipError(null);

    try {
      const details = await lookupCepLocation(digits);

      setLocationOpen(false);

      syncLocationInUrl({
        mode: "zip",
        zip: formatCep(digits),
        city: details.city,
        state: details.state,
        label: formatLocationLabel(details.city, details.state),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível consultar o CEP.";
      setZipError(message);
    } finally {
      setZipLoading(false);
    }
  }

  const handleUseCurrentLocation = useCallback(async () => {
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError("Seu navegador não oferece suporte à geolocalização.");
      return;
    }

    setGeoLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const details = await lookupReverseGeocodeLocation(
        position.coords.latitude,
        position.coords.longitude,
      );

      setLocationOpen(false);

      syncLocationInUrl({
        mode: "geo",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        city: details.city,
        state: details.state,
        label: formatLocationLabel(details.city, details.state),
      });
    } catch {
      syncLocationInUrl({
        mode: "city",
        city: DEFAULT_CITY.city,
        state: DEFAULT_CITY.state,
        label: formatLocationLabel(DEFAULT_CITY.city, DEFAULT_CITY.state),
      });
    } finally {
      setGeoLoading(false);
    }
  }, [syncLocationInUrl]);

  useEffect(() => {
    if (autoLocationAttemptRef.current) return;
    if (new URLSearchParams(searchParamsString).has("locationMode")) return;
    if (!("geolocation" in navigator)) return;

    autoLocationAttemptRef.current = true;
    void handleUseCurrentLocation();
  }, [handleUseCurrentLocation, searchParamsString]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      const inLocationPanel = locationPanelRef.current?.contains(target) ?? false;
      const inLocationButton = locationButtonRef.current?.contains(target) ?? false;
      const inStateButton = stateButtonRef.current?.contains(target) ?? false;
      const inStateDropdown = stateDropdownRef.current?.contains(target) ?? false;

      if (inLocationPanel) {
        if (!inStateButton && !inStateDropdown) {
          setStateDropdownOpen(false);
        }
        return;
      }

      if (inLocationButton) return;

      setLocationOpen(false);
      setStateDropdownOpen(false);
      setCityInputTouched(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLocationOpen(false);
        setStateDropdownOpen(false);
        setCityInputTouched(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-md">
      <div className="mx-auto flex h-20 w-full max-w-[1536px] items-center px-8">
        <div className="flex flex-1 justify-start">
          <Link href="/" className="flex items-center">
            <Image src="/logo1.svg" alt="Roletei" width={110} height={36} priority />
          </Link>
        </div>

        <div className="relative flex flex-[2] items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="relative flex h-11 w-full items-center rounded-full border border-input bg-background px-4 shadow-sm transition-all duration-200 focus-within:border-[#F58318] focus-within:ring-4 focus-within:ring-[#F58318]/20 focus-within:shadow-[0_0_0_1px_rgba(245,131,24,0.35),0_0_24px_rgba(245,131,24,0.18)]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToSearchResults();
                }}
                placeholder="O que você quer curtir hoje?"
                className="h-10 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
              />

              <div className="mx-2 h-6 w-px bg-border" />

              <button
                ref={locationButtonRef}
                type="button"
                onClick={handleOpenLocationPanel}
                className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-[#F58318]"
                aria-expanded={locationOpen}
                aria-haspopup="dialog"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {currentLocation.label}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {locationOpen ? (
                <div
                  ref={locationPanelRef}
                  className="absolute right-0 top-full z-[60] mt-3 w-[400px] rounded-xl border border-input bg-white p-4 shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Localização</p>

                    <button
                      type="button"
                      onClick={() => {
                        setLocationOpen(false);
                        setCityInputTouched(false);
                      }}
                      className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                    >
                      Fechar
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center">
                        <p className="text-sm font-medium leading-none text-slate-900">
                          Usar minha localização
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={geoLoading}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#F58318] ring-1 ring-[#F58318]/20 transition-colors hover:bg-[#F58318]/5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {geoLoading ? "Buscando..." : "Usar"}
                      </button>
                    </div>

                    {geoError ? <p className="text-xs text-red-600">{geoError}</p> : null}

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        OU
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-[80px_minmax(0,1fr)] md:items-start">
                      <div className="grid gap-2">
                        <label
                          htmlFor="location-state"
                          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                        >
                          UF
                        </label>
                        <div ref={stateDropdownRef} className="relative">
                          <button
                            ref={stateButtonRef}
                            type="button"
                            onClick={handleToggleStateDropdown}
                            className={`flex h-8 w-full items-center justify-between rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F58318]/20 ${
                              stateDropdownOpen
                                ? "border-[#F58318] text-[#F58318] ring-4 ring-[#F58318]/20"
                                : "border-input text-slate-900 hover:border-[#F58318] hover:text-[#F58318]"
                            }`}
                            aria-expanded={stateDropdownOpen}
                            aria-haspopup="listbox"
                          >
                            <span>{selectedStateUf}</span>
                            <ChevronDown className="h-4 w-4 text-current" />
                          </button>

                          <SearchDropdown
                            open={stateDropdownOpen}
                            loading={false}
                            error={null}
                            emptyLabel="Nenhum estado encontrado."
                            items={BRAZIL_STATES.map(([uf]) => ({
                              id: uf,
                              label: uf,
                            }))}
                            onSelect={(item) => handleStateChange(item.id)}
                            className="max-h-56 overflow-y-auto"
                            itemClassName="px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="location-city"
                          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                        >
                          Cidade
                        </label>
                        <div className="relative">
                          <Input
                            id="location-city"
                            value={cityQuery}
                            onChange={(e) => {
                              setCityQuery(e.target.value);
                              setCityInputTouched(true);
                              setCityError(null);
                            }}
                            onFocus={() => setCityInputTouched(true)}
                            onKeyDown={handleCityKeyDown}
                            autoComplete="off"
                            placeholder={`Digite uma cidade de ${getStateName(selectedStateUf)}`}
                            className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-[#F58318] focus-visible:ring-4 focus-visible:ring-[#F58318]/20 md:text-sm"
                          />

                          <SearchDropdown
                            open={locationOpen && cityInputTouched}
                            loading={citiesLoading}
                            error={citiesError}
                            emptyLabel={
                              citiesLoading
                                ? "Carregando cidades..."
                                : cityQuery.trim().length > 0
                                  ? "Nenhuma cidade encontrada."
                                  : "Digite o nome de uma cidade."
                            }
                            items={filteredCityOptions.map((city) => ({
                              id: city,
                              label: city,
                            }))}
                            onSelect={(item) => handleSelectCity(item.label)}
                            className="max-h-60 overflow-y-auto"
                            itemClassName="px-3 py-1.5 text-sm"
                          />
                        </div>

                        {cityError ? (
                          <p className="text-xs text-red-600">{cityError}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        OU
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        CEP
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={zipDraft}
                          onChange={(e) => {
                            setZipError(null);
                            setZipDraft(formatCep(e.target.value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleApplyZip();
                            }
                          }}
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="30140-071"
                          maxLength={9}
                          className="h-8 rounded-lg border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-[#F58318] focus-visible:ring-4 focus-visible:ring-[#F58318]/20 md:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void handleApplyZip();
                          }}
                          disabled={zipLoading}
                          className="h-8 rounded-lg bg-[#F58318] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#F58318]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {zipLoading ? "Buscando..." : "Aplicar"}
                        </button>
                      </div>
                      {zipError ? (
                        <p className="text-xs text-red-600">{zipError}</p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Digite os 8 números do CEP para usar como filtro.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <SearchDropdown
                open={search.query.trim().length > 0}
                loading={search.loading}
                error={search.error}
                items={search.results.map((hit) => ({
                  id: hit.id,
                  label: hit.title,
                }))}
                onSelect={(item) => {
                  console.log("event.search.select", item.id);
                  search.setQuery(item.label);
                  router.push(`/eventos/${item.id}`);
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <HeaderLinks />
        </div>
      </div>
    </header>
  );
}
