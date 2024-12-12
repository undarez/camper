"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import LoadingMap from "@/app/pages/MapComponent/LoadingMap/page";
import { CamperWashStation, GeoapifyResult } from "@/app/types";
import AddStationModal from "@/app/pages/MapComponent/AddStation_modal/AddStationModal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ConnectYou from "@/app/pages/auth/connect-you/page";
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

const LocalisationStation = () => {
  const { status } = useSession();
  const [existingLocations, setExistingLocations] = useState<
    CamperWashStation[]
  >([]);
  const [selectedLocation, setSelectedLocation] =
    useState<GeoapifyResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Clé pour forcer le rendu de la carte

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
      setMapKey((prev) => prev + 1); // Force le rendu de la carte
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

  if (status === "unauthenticated") {
    return <ConnectYou />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredLocations = existingLocations.filter((location) => {
    const matchesSearch =
      location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Carte des stations CamperWash</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Rechercher une station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
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
      </div>

      <div className="flex items-center gap-4 mb-6">
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

      <div className="h-[600px] rounded-lg overflow-hidden border border-border">
        <AdressGeoapifyWithNoSSR
          key={mapKey}
          onAddressSelect={handleAddressSelect}
          existingLocations={filteredLocations}
          isModalOpen={isModalOpen}
          persistSearchBar={true}
        />
      </div>

      <AddStationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLocation={selectedLocation}
        onAddStation={handleAddStation}
      />
    </div>
  );
};

export default LocalisationStation;
