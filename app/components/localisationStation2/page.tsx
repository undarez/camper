"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import LoadingMap from "@/app/pages/MapComponent/LoadingMap/page";
import { CamperWashStation, GeoapifyResult } from "@/app/types";
import AddStationModal from "@/app/pages/MapComponent/AddStation_modal/AddStationModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ConnectYou from "@/app/pages/auth/connect-you/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";

const AdressGeoapifyWithNoSSR = dynamic(
  () =>
    import("@/app/components/AdressGeoapify/AdressGeoapifyWrapper").then(
      (mod) => mod.default
    ),
  { ssr: false, loading: () => <LoadingMap /> }
);

const STATUS_DISPLAY: Record<string, string> = {
  active: "Active",
  en_attente: "En attente",
  inactive: "Inactive",
};

const LocalisationStation = () => {
  const { data: session } = useSession();
  const [existingLocations, setExistingLocations] = useState<
    CamperWashStation[]
  >([]);
  const [selectedLocation, setSelectedLocation] =
    useState<GeoapifyResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsAdmin(session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  }, [session]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stationUpdapte");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des stations");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setExistingLocations(data);
        } else {
          console.error("Les données reçues ne sont pas un tableau:", data);
          setExistingLocations([]);
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les stations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleAddStation = async (
    station: Omit<CamperWashStation, "id" | "createdAt">
  ) => {
    try {
      const response = await fetch("/api/stationUpdapte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(station),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la station");
      }

      const newStation = await response.json();
      setExistingLocations((prev) => [newStation, ...prev]);
      toast.success("Station ajoutée avec succès");
      setIsModalOpen(false);
      setMapKey((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'ajouter la station");
    }
  };

  const handleAddressSelect = (formatted: string, lat: number, lon: number) => {
    setSelectedLocation({
      properties: { formatted, lat, lon },
    });
    setIsModalOpen(true);
  };

  if (!session) {
    return <ConnectYou />;
  }

  const filteredLocations = existingLocations.filter((location) => {
    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    return matchesStatus;
  });

  const activeStations = filteredLocations.filter(
    (location) => location.status === "active"
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement des stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto md:pl-64">
        <div className="p-4 space-y-6">
          <div className="flex justify-end items-center">
            <h1 className="text-2xl font-bold">
              Carte des stations CamperWash
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-auto flex-grow">
              <GeoapifyContext
                apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}
              >
                <GeoapifyGeocoderAutocomplete
                  placeholder="Rechercher une adresse..."
                  lang="fr"
                  limit={5}
                  debounceDelay={300}
                  countryCodes={["fr"]}
                  placeSelect={(value) => {
                    if (value) {
                      const { lat, lon, formatted } = value.properties;
                      handleAddressSelect(formatted, lat, lon);
                    }
                  }}
                />
              </GeoapifyContext>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrer par status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden border border-border">
                <AdressGeoapifyWithNoSSR
                  key={`map-${mapKey}`}
                  onAddressSelect={handleAddressSelect}
                  existingLocations={filteredLocations}
                  isModalOpen={isModalOpen}
                  persistSearchBar={false}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Total stations
                    </p>
                    <p className="text-2xl font-bold">
                      {filteredLocations.length}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-md">
                    <p className="text-sm text-muted-foreground">Actives</p>
                    <p className="text-2xl font-bold text-green-500">
                      {activeStations.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Stations récentes</h2>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = "/pages/AdminStation/AdminPage")
                      }
                    >
                      Gérer les stations
                    </Button>
                  )}
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {filteredLocations.slice(0, 5).map((location) => (
                    <div
                      key={location.id}
                      className="p-3 bg-background rounded-md space-y-1"
                    >
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.address}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            location.status === "active"
                              ? "bg-green-500"
                              : location.status === "en_attente"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        <span className="text-xs text-muted-foreground">
                          {STATUS_DISPLAY[location.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AddStationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedLocation={selectedLocation}
            onAddStation={handleAddStation}
          />
        </div>
      </div>
    </div>
  );
};

export default LocalisationStation;
