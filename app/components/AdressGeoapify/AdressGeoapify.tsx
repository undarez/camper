"use client";

import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CamperWashStation,
  ElectricityType,
  GeoapifyResult,
  HighPressureType,
} from "@/app/types";
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import { icon } from "leaflet";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

// Configuration des icônes Leaflet selon le statut
const createIcon = (status: string) => {
  const color =
    status === "active"
      ? "green"
      : status === "en_attente"
      ? "orange"
      : status === "inactive"
      ? "red"
      : "blue";

  return icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

interface AddressProps {
  onAddressSelect: (formatted: string, lat: number, lon: number) => void;
  existingLocations?: CamperWashStation[];
  isModalOpen?: boolean;
}

interface StationServices {
  id: string;
  highPressure: HighPressureType;
  tirePressure: boolean;
  vacuum: boolean;
  handicapAccess: boolean;
  wasteWater: boolean;
  electricity: ElectricityType;
  paymentMethods: string[];
  maxVehicleLength: number | null;
}

const AdressGeoapify = ({
  onAddressSelect,
  existingLocations = [],
  isModalOpen = false,
}: AddressProps) => {
  const handleNewLocationSelect = (location: GeoapifyResult) => {
    const { formatted, lat, lon } = location.properties;
    onAddressSelect(formatted, lat, lon);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500 inline-block" />;
      case "en_attente":
        return <Clock className="h-4 w-4 text-yellow-500 inline-block" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500 inline-block" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Validée";
      case "en_attente":
        return "En attente";
      default:
        return "Non validée";
    }
  };

  const formatServices = (services: StationServices) => {
    const servicesList = [];
    if (services.highPressure !== "NONE")
      servicesList.push(`Haute pression: ${services.highPressure}`);
    if (services.tirePressure) servicesList.push("Pression des pneus");
    if (services.vacuum) servicesList.push("Aspirateur");
    if (services.handicapAccess) servicesList.push("Accès handicapé");
    if (services.wasteWater) servicesList.push("Eaux usées");
    if (services.electricity !== "NONE")
      servicesList.push(`Électricité: ${services.electricity}`);
    return servicesList;
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <div className="relative w-full z-[9999]">
          <GeoapifyContext apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}>
            <GeoapifyGeocoderAutocomplete
              placeholder="Rechercher une adresse..."
              lang="fr"
              limit={5}
              debounceDelay={300}
              countryCodes={["fr"]}
              placeSelect={(value) => {
                if (value) {
                  handleNewLocationSelect(value as GeoapifyResult);
                }
              }}
            />
          </GeoapifyContext>
        </div>
      </div>
      {!isModalOpen && (
        <div className="h-[600px] rounded-lg overflow-hidden border border-border relative">
          <MapContainer
            center={[46.603354, 1.888334]}
            zoom={6}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {existingLocations.map((location) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={createIcon(location.status)}
              >
                <Popup className="station-popup">
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-base">{location.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {location.address}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Coordonnées: {location.lat.toFixed(6)},{" "}
                        {location.lng.toFixed(6)}
                      </p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(location.status)}
                        <span className="text-sm">
                          {getStatusText(location.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  className="station-tooltip"
                >
                  <div className="bg-white p-2 rounded-lg shadow-lg max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <strong className="text-sm">{location.name}</strong>
                      {getStatusIcon(location.status)}
                    </div>
                    <div className="space-y-1">
                      {formatServices(location.services).map(
                        (service, index) => (
                          <div key={index} className="text-xs">
                            • {service}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default AdressGeoapify;
