import type { LatLngTuple } from "leaflet";

export type StationStatus = "active" | "en_attente" | "inactive";

export type HighPressureType =
  | "NONE"
  | "PASSERELLE"
  | "ECHAFAUDAGE"
  | "PORTIQUE";
export type ElectricityType = "NONE" | "AMP_8" | "AMP_15" | null;
export type PaymentMethodType = "JETON" | "ESPECES" | "CARTE_BANCAIRE";

export type ServiceType = {
  id: string;
  highPressure: HighPressureType;
  tirePressure: boolean;
  vacuum: boolean;
  handicapAccess: boolean;
  wasteWater: boolean;
  electricity: ElectricityType;
  paymentMethods: PaymentMethodType[];
  maxVehicleLength: number | null;
  stationId?: string;
};

export const SERVICE_LABELS: Record<
  keyof Omit<
    ServiceType,
    "id" | "electricity" | "paymentMethods" | "maxVehicleLength" | "stationId"
  >,
  string
> = {
  highPressure: "Haute pression",
  tirePressure: "Gonflage pneus",
  vacuum: "Aspirateur",
  handicapAccess: "Accès PMR",
  wasteWater: "Eaux usées",
};

export type StationAuthor = {
  name: string | null;
  email: string;
  image?: string | null;
};

export type CamperWashStation = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  services: ServiceType;
  status: StationStatus;
  author: StationAuthor;
  createdAt: Date;
};

export type GeoapifyResult = {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
  };
};

export type StationFilters = {
  services: Partial<
    Record<
      keyof Omit<
        ServiceType,
        | "id"
        | "electricity"
        | "paymentMethods"
        | "maxVehicleLength"
        | "stationId"
      >,
      boolean
    >
  >;
  status: StationStatus | "all";
  search: string;
};

export type MapComponentProps = {
  position: LatLngTuple;
  selectedLocation: CamperWashStation | null;
  existingLocations: CamperWashStation[];
  onLocationSelect: (location: CamperWashStation) => void;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
};

export type FormValues = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  services: Omit<ServiceType, "id" | "stationId">;
  images: string[];
};

export type IconType = StationStatus | "default" | "selected";

export type StationStats = {
  totalStations: number;
  activeStations: number;
  pendingStations: number;
  inactiveStations: number;
  stationsPerService: Array<{
    name: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
    type: "creation" | "validation" | "deletion";
  }>;
};

export type StationCardProps = {
  station: CamperWashStation;
  onStatusChange?: (id: string, status: StationStatus) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isAdmin?: boolean;
  showActions?: boolean;
};
