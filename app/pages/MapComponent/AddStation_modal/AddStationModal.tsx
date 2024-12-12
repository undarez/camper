"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  GeoapifyResult,
  CamperWashStation,
  HighPressureType,
  ElectricityType,
  StationStatus,
  PaymentMethodType,
  ServiceType,
} from "@/app/types";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const AdressGeoapifyWithNoSSR = dynamic(
  () => import("@/app/components/AdressGeoapify/AdressGeoapify"),
  { ssr: false }
);

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: GeoapifyResult | null;
  onAddStation: (
    station: Omit<CamperWashStation, "id" | "createdAt">
  ) => Promise<void>;
}

const PAYMENT_METHODS: PaymentMethodType[] = [
  "JETON",
  "ESPECES",
  "CARTE_BANCAIRE",
];

const AddStationModal = ({
  isOpen,
  onClose,
  selectedLocation,
  onAddStation,
}: AddStationModalProps) => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<
    Omit<CamperWashStation, "id" | "createdAt">
  >({
    name: "",
    address: selectedLocation?.properties.formatted || "",
    lat: selectedLocation?.properties.lat || 0,
    lng: selectedLocation?.properties.lon || 0,
    images: [],
    services: {
      id: uuidv4(),
      highPressure: "NONE" as HighPressureType,
      tirePressure: false,
      vacuum: false,
      handicapAccess: false,
      wasteWater: false,
      electricity: "NONE" as ElectricityType,
      paymentMethods: [] as PaymentMethodType[],
      maxVehicleLength: 0,
      stationId: "",
    } as ServiceType,
    status: "en_attente" as StationStatus,
    author: {
      name: session?.user?.name || null,
      email: session?.user?.email || "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddStation(formData);

      // Notification email
      await fetch("/api/notify-new-station", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          author: formData.author,
          services: formData.services,
        }),
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la station:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle station</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la station</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <AdressGeoapifyWithNoSSR
                onAddressSelect={(formatted, lat, lon) => {
                  setFormData((prev) => ({
                    ...prev,
                    address: formatted,
                    lat: lat,
                    lng: lon,
                  }));
                }}
                existingLocations={[]}
                isModalOpen={isOpen}
              />
            </div>

            <div className="grid gap-2">
              <Label>Services disponibles</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="highPressure">Haute pression</Label>
                  <select
                    id="highPressure"
                    value={formData.services.highPressure}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          highPressure: e.target.value as HighPressureType,
                        },
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="NONE">Aucune</option>
                    <option value="PASSERELLE">Passerelle</option>
                    <option value="ECHAFAUDAGE">Échafaudage</option>
                    <option value="PORTIQUE">Portique</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="electricity">Électricité</Label>
                  <select
                    id="electricity"
                    value={formData.services.electricity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          electricity: e.target.value as ElectricityType,
                        },
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="NONE">Aucune</option>
                    <option value="AMP_8">8 Ampères</option>
                    <option value="AMP_15">15 Ampères</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tirePressure"
                    checked={formData.services.tirePressure}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          tirePressure: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="tirePressure">Pression des pneus</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vacuum"
                    checked={formData.services.vacuum}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          vacuum: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="vacuum">Aspirateur</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="handicapAccess"
                    checked={formData.services.handicapAccess}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          handicapAccess: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="handicapAccess">Accès handicapé</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wasteWater"
                    checked={formData.services.wasteWater}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          wasteWater: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="wasteWater">Eaux usées</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Moyens de paiement</Label>
              <div className="flex gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={method}
                      checked={formData.services.paymentMethods.includes(
                        method
                      )}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            paymentMethods: e.target.checked
                              ? [...prev.services.paymentMethods, method]
                              : prev.services.paymentMethods.filter(
                                  (m) => m !== method
                                ),
                          },
                        }));
                      }}
                    />
                    <Label htmlFor={method}>
                      {method === "JETON"
                        ? "Jeton"
                        : method === "ESPECES"
                        ? "Espèces"
                        : "Carte bancaire"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxVehicleLength">
                Longueur maximale du véhicule (en mètres)
              </Label>
              <Input
                type="number"
                id="maxVehicleLength"
                value={formData.services.maxVehicleLength}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      maxVehicleLength: Number(e.target.value),
                    },
                  }));
                }}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Ajouter la station</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationModal;
