"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { LatLngTuple } from "leaflet";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  GeoapifyResult,
  CamperWashStation,
  AdressGeoapifyProps,
} from "@/app/types/typesGeoapify";

// Chargement dynamique de la carte
const Map = dynamic(
  () => import("@/app/pages/MapComponent/page").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-input flex items-center justify-center bg-muted">
        <span className="text-muted-foreground">Chargement de la carte...</span>
      </div>
    ),
  }
);

// Schéma de validation
const formSchema = z.object({
  address: z.string().min(1, "L'adresse est requise"),
  lat: z.number(),
  lng: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export const AdressGeoapify = ({
  onAddressSelect,
  errors,
  existingLocations = [],
  defaultValue,
}: AdressGeoapifyProps) => {
  const [position, setPosition] = useState<LatLngTuple>(
    defaultValue ? [defaultValue.lat, defaultValue.lon] : [46.227638, 2.213749]
  );
  const [selectedLocation, setSelectedLocation] =
    useState<CamperWashStation | null>(
      defaultValue
        ? {
            id: "temp-id",
            name: "Nouvel emplacement",
            address: defaultValue.formatted,
            lat: defaultValue.lat,
            lng: defaultValue.lon,
            images: [],
            services: {
              highPressure: "NONE",
              tirePressure: false,
              vacuum: false,
              handicapAccess: false,
              wasteWater: false,
              electricity: "NONE",
              paymentMethods: [],
              maxVehicleLength: 0,
            },
            status: "en_attente",
            author: {
              name: null,
              email: "",
            },
            createdAt: new Date(),
          }
        : null
    );

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: defaultValue?.formatted || "",
      lat: defaultValue?.lat || 46.227638,
      lng: defaultValue?.lon || 2.213749,
    },
  });

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  const handlePlaceSelect = (value: GeoapifyResult | null) => {
    if (!value) return;
    const { lat, lon, formatted } = value.properties;
    const newPosition: LatLngTuple = [lat, lon];
    setPosition(newPosition);
    setSelectedLocation({
      id: "temp-id",
      name: "Nouvel emplacement",
      address: formatted,
      lat,
      lng: lon,
      images: [],
      services: {
        highPressure: "NONE",
        tirePressure: false,
        vacuum: false,
        handicapAccess: false,
        wasteWater: false,
        electricity: "NONE",
        paymentMethods: [],
        maxVehicleLength: 0,
      },
      status: "en_attente",
      author: {
        name: null,
        email: "",
      },
      createdAt: new Date(),
    });
    onAddressSelect(formatted, lat, lon);
  };

  const handleLocationSelect = (location: CamperWashStation) => {
    setSelectedLocation(location);
    setPosition([location.lat, location.lng]);
    methods.setValue("address", location.address);
    methods.setValue("lat", location.lat);
    methods.setValue("lng", location.lng);
  };

  useEffect(() => {
    if (defaultValue) {
      setPosition([defaultValue.lat, defaultValue.lon]);
      methods.setValue("address", defaultValue.formatted);
      methods.setValue("lat", defaultValue.lat);
      methods.setValue("lng", defaultValue.lon);
      onAddressSelect(
        defaultValue.formatted,
        defaultValue.lat,
        defaultValue.lon
      );
    }
  }, [defaultValue, onAddressSelect, methods]);

  if (!apiKey) {
    console.error("La clé API Geoapify n'est pas définie");
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <FormField
          control={methods.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rechercher une adresse</FormLabel>
              <FormControl>
                <div className="relative w-full rounded-md border border-input bg-background">
                  <GeoapifyContext apiKey={apiKey}>
                    <GeoapifyGeocoderAutocomplete
                      placeholder="Entrez l'adresse de la station"
                      lang="fr"
                      countryCodes={["fr"]}
                      limit={5}
                      value={field.value}
                      placeSelect={handlePlaceSelect}
                    />
                  </GeoapifyContext>
                </div>
              </FormControl>
              <FormMessage>{errors?.address?.message}</FormMessage>
            </FormItem>
          )}
        />

        {selectedLocation && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Adresse:</span>{" "}
                {selectedLocation.address}
              </p>
              <p>
                <span className="font-medium">Services:</span>
                <ul className="ml-4">
                  {Object.entries(selectedLocation.services).map(
                    ([key, value]) =>
                      key !== "id" && (
                        <li key={key} className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              value ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {key}: {value ? "Oui" : "Non"}
                        </li>
                      )
                  )}
                </ul>
              </p>
            </div>
          </div>
        )}

        <div className="h-[400px] w-full">
          <Map
            position={position}
            selectedLocation={selectedLocation}
            existingLocations={existingLocations}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={methods.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input {...field} value={position[0]} readOnly />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input {...field} value={position[1]} readOnly />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default AdressGeoapify;