"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import LoadingMap from "@/app/pages/MapComponent/LoadingMap/page";
import { CamperWashStation, GeoapifyResult } from "@/app/types";
import AddStationModal from "@/app/pages/MapComponent/AddStation_modal/AddStationModal";
import { Input } from "@/components/ui/input";
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
  { ssr: false, loading: () => <LoadingMap /> }
);

const LocalisationStation = () => {
  const { data: session } = useSession();
  const [existingLocations, setExistingLocations] = useState<
    CamperWashStation[]
  >([]);
  const [selectedLocation, setSelectedLocation] =
    useState<GeoapifyResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const handleAddressSelect = (formatted: string, lat: number, lon: number) => {
    setSelectedLocation({
      properties: { formatted, lat, lon },
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Carte des stations CamperWash</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="w-full md:w-[400px]">
            <AdressGeoapifyWithNoSSR
              onAddressSelect={handleAddressSelect}
              existingLocations={[]}
              isModalOpen={false}
            />
          </div>

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

      {/* Reste du code ... */}

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
