"use client";

import { CamperWashStation } from "@/app/types";
import AdressGeoapify from "./AdressGeoapify";

interface AdressGeoapifyWrapperProps {
  onAddressSelect: (formatted: string, lat: number, lon: number) => void;
  existingLocations?: CamperWashStation[];
  isModalOpen?: boolean;
}

export default function AdressGeoapifyWrapper({
  onAddressSelect,
  existingLocations = [],
  isModalOpen = false,
}: AdressGeoapifyWrapperProps) {
  return (
    <AdressGeoapify
      onAddressSelect={onAddressSelect}
      existingLocations={existingLocations}
      isModalOpen={isModalOpen}
    />
  );
}
