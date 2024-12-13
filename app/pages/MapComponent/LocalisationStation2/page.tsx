"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingMap from "@/app/pages/MapComponent/LoadingMap/page";
import { CamperWashStation, GeoapifyResult } from "@/app/types";
import AddStationModal from "@/app/pages/MapComponent/AddStation_modal/AddStationModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdressGeoapifyWithNoSSR = dynamic(
  () =>
    import("@/app/components/AdressGeoapify/AdressGeoapifyWrapper").then(
      (mod) => mod.default
    ),
  {
    ssr: false,
    loading: () => <LoadingMap />,
  }
);

const LocalisationStation2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<GeoapifyResult | null>(null);
  const [existingLocations, setExistingLocations] = useState<
    CamperWashStation[]
  >([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mapKey, setMapKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLocations = async () => {
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
    }
  };

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddressSelect = async (
    formatted: string,
    lat: number,
    lon: number
  ) => {
    setSelectedLocation({
      properties: {
        formatted,
        lat,
        lon,
      },
    } as GeoapifyResult);
    setIsModalOpen(true);
  };

  const filteredLocations = existingLocations.filter((location) => {
    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto w-full md:pl-[250px]">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl md:text-2xl font-bold">
              Carte des stations CamperWash
            </h1>

            <div
              className="geocapify-geocoder-container"
              style={{ display: "block" }}
            >
              <div
                className="geocoder-container"
                style={{ position: "relative" }}
              >
                <input
                  className="geocapify-autocomplete-input"
                  type="text"
                  placeholder="Rechercher une adresse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-sm">En attente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm">Inactive</span>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
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
          </div>

          <div className="h-[calc(100vh-300px)] rounded-lg overflow-hidden border border-border relative">
            <AdressGeoapifyWithNoSSR
              key={`map-${mapKey}`}
              onAddressSelect={handleAddressSelect}
              existingLocations={filteredLocations}
              isModalOpen={isModalOpen}
              persistSearchBar={false}
            />
          </div>

          <AddStationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedLocation={selectedLocation}
            onAddStation={handleAddStation}
          />
        </div>
      </main>
    </div>
  );
};

export default LocalisationStation2;
