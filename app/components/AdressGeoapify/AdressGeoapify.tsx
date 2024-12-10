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
    return servicesList.join("\n");
  };

  if (isModalOpen) {
    return null;
  }

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
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-sm text-gray-600">
                    Latitude: {location.lat}
                  </p>
                  <p className="text-sm text-gray-600">
                    Longitude: {location.lng}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        location.status === "active"
                          ? "bg-green-100 text-green-800"
                          : location.status === "en_attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {location.status === "active"
                        ? "Active"
                        : location.status === "en_attente"
                        ? "En attente"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} permanent>
                <div className="text-sm">
                  <strong>{location.name}</strong>
                  <br />
                  {formatServices(location.services)}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdressGeoapify;
