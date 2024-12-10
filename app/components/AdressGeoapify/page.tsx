"use client";

import { CamperWashStation } from "@/app/types";
import AdressGeoapify from "./AdressGeoapify";

interface AdressGeoapifyPageProps {
  onAddressSelect: (formatted: string, lat: number, lon: number) => void;
  existingLocations?: CamperWashStation[];
  isModalOpen?: boolean;
}

export default function AdressGeoapifyPage({
  onAddressSelect,
  existingLocations = [],
  isModalOpen = false,
}: AdressGeoapifyPageProps) {
  return (
    <AdressGeoapify
      onAddressSelect={onAddressSelect}
      existingLocations={existingLocations}
      isModalOpen={isModalOpen}
    />
  );
}
