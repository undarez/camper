import { sendNewStationNotification } from "@/lib/email";
import { NextResponse } from "next/server";
import { z } from "zod";

const notificationSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-type doit être application/json" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const validatedData = notificationSchema.parse(body);

    await sendNewStationNotification(validatedData.name, validatedData.address);

    return NextResponse.json({
      success: true,
      message: "Notification envoyée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de l'envoi de la notification",
      },
      { status: 500 }
    );
  }
}
