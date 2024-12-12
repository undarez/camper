"use client";

import { CamperWashStation } from "@/app/types";
import AdressGeoapify from "./AdressGeoapify";

interface AdressGeoapifyWrapperProps {
  onAddressSelect: (formatted: string, lat: number, lon: number) => void;
  existingLocations?: CamperWashStation[];
  isModalOpen?: boolean;
  persistSearchBar?: boolean;
}

export default function AdressGeoapifyWrapper({
  onAddressSelect,
  existingLocations = [],
  isModalOpen = false,
  persistSearchBar = false,
}: AdressGeoapifyWrapperProps) {
  return (
    <AdressGeoapify
      onAddressSelect={onAddressSelect}
      existingLocations={existingLocations}
      isModalOpen={isModalOpen}
      persistSearchBar={persistSearchBar}
    />
  );
}
