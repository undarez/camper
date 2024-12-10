"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GeoapifyResult,
  CamperWashStation,
  HighPressureType,
  ElectricityType,
  StationStatus,
} from "@/app/types";

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: GeoapifyResult | null;
  onAddStation: (
    station: Omit<CamperWashStation, "id" | "createdAt">
  ) => Promise<void>;
}

const AddStationModal = ({
  isOpen,
  onClose,
  selectedLocation,
  onAddStation,
}: AddStationModalProps) => {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [services, setServices] = useState({
    id: uuidv4(),
    highPressure: "NONE" as HighPressureType,
    tirePressure: false,
    vacuum: false,
    handicapAccess: false,
    wasteWater: false,
    electricity: "NONE" as ElectricityType,
    paymentMethods: [],
    maxVehicleLength: null,
    stationId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) return;

    setIsSubmitting(true);
    try {
      const newStation = {
        name,
        address: selectedLocation.properties.formatted,
        lat: selectedLocation.properties.lat,
        lng: selectedLocation.properties.lon,
        images: [],
        services,
        status: "en_attente" as StationStatus,
        author: {
          name: session?.user?.name || null,
          email: session?.user?.email || "",
        },
      };

      await onAddStation(newStation);

      await fetch("/api/notify-new-station", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          address: selectedLocation.properties.formatted,
          author: {
            name: session?.user?.name || null,
            email: session?.user?.email || "",
          },
          services: {
            highPressure: services.highPressure,
            tirePressure: services.tirePressure,
            vacuum: services.vacuum,
            handicapAccess: services.handicapAccess,
            wasteWater: services.wasteWater,
            electricity: services.electricity,
          },
        }),
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la station:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset le formulaire quand il se ferme
  const handleClose = () => {
    setName("");
    setServices({
      id: uuidv4(),
      highPressure: "NONE" as HighPressureType,
      tirePressure: false,
      vacuum: false,
      handicapAccess: false,
      wasteWater: false,
      electricity: "NONE" as ElectricityType,
      paymentMethods: [],
      maxVehicleLength: null,
      stationId: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la station</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Station Paris Centre"
              required
            />
          </div>

          <div>
            <Label>Adresse</Label>
            <p className="text-sm text-muted-foreground">
              {selectedLocation?.properties.formatted}
            </p>
          </div>

          <div className="space-y-4">
            <Label>Services disponibles</Label>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highPressure">Type de haute pression</Label>
                <Select
                  value={services.highPressure}
                  onValueChange={(value: HighPressureType) =>
                    setServices({
                      ...services,
                      highPressure: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucune haute pression</SelectItem>
                    <SelectItem value="PASSERELLE">Passerelle</SelectItem>
                    <SelectItem value="ECHAFAUDAGE">Échafaudage</SelectItem>
                    <SelectItem value="PORTIQUE">Portique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricity">Type d&apos;électricité</Label>
                <Select
                  value={services.electricity}
                  onValueChange={(value: ElectricityType) =>
                    setServices({
                      ...services,
                      electricity: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Pas d&apos;électricité</SelectItem>
                    <SelectItem value="AMP_8">8 Ampères</SelectItem>
                    <SelectItem value="AMP_15">15 Ampères</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modes de paiement acceptés</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="JETON"
                      checked={services.paymentMethods.includes("JETON")}
                      onCheckedChange={(checked) => {
                        setServices({
                          ...services,
                          paymentMethods: checked
                            ? [...services.paymentMethods, "JETON"]
                            : services.paymentMethods.filter(
                                (m) => m !== "JETON"
                              ),
                        });
                      }}
                    />
                    <Label htmlFor="JETON">Jeton</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ESPECES"
                      checked={services.paymentMethods.includes("ESPECES")}
                      onCheckedChange={(checked) => {
                        setServices({
                          ...services,
                          paymentMethods: checked
                            ? [...services.paymentMethods, "ESPECES"]
                            : services.paymentMethods.filter(
                                (m) => m !== "ESPECES"
                              ),
                        });
                      }}
                    />
                    <Label htmlFor="ESPECES">Espèces</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="CARTE_BANCAIRE"
                      checked={services.paymentMethods.includes(
                        "CARTE_BANCAIRE"
                      )}
                      onCheckedChange={(checked) => {
                        setServices({
                          ...services,
                          paymentMethods: checked
                            ? [...services.paymentMethods, "CARTE_BANCAIRE"]
                            : services.paymentMethods.filter(
                                (m) => m !== "CARTE_BANCAIRE"
                              ),
                        });
                      }}
                    />
                    <Label htmlFor="CARTE_BANCAIRE">Carte bancaire</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tirePressure"
                    checked={services.tirePressure}
                    onCheckedChange={(checked) =>
                      setServices({
                        ...services,
                        tirePressure: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="tirePressure">Gonflage pneus</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vacuum"
                    checked={services.vacuum}
                    onCheckedChange={(checked) =>
                      setServices({
                        ...services,
                        vacuum: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="vacuum">Aspirateur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="handicapAccess"
                    checked={services.handicapAccess}
                    onCheckedChange={(checked) =>
                      setServices({
                        ...services,
                        handicapAccess: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="handicapAccess">Accès handicapé</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wasteWater"
                    checked={services.wasteWater}
                    onCheckedChange={(checked) =>
                      setServices({
                        ...services,
                        wasteWater: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="wasteWater">Eaux usées</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVehicleLength">
                    Longueur maximale du véhicule (en mètres)
                  </Label>
                  <Input
                    type="number"
                    id="maxVehicleLength"
                    value={services.maxVehicleLength ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setServices({
                        ...services,
                        maxVehicleLength: value ? Number(value) : null,
                      });
                    }}
                    placeholder="Ex: 8"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ajout en cours..." : "Ajouter la station"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationModal;
