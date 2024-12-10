"use client";

import { MapComponentProps } from "@/app/types";
import { MapComponent } from "./MapComponent";

export default function MapComponentWrapper(props: MapComponentProps) {
  return <MapComponent {...props} />;
}
