import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/AuthOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const totalStations = await prisma.station.count();
    const activeStations = await prisma.station.count({
      where: { status: "active" },
    });
    const pendingStations = await prisma.station.count({
      where: { status: "en_attente" },
    });

    // Pour les visites, nous pourrions implémenter un système de tracking plus tard
    // Pour l'instant, on renvoie des valeurs par défaut
    const stats = {
      totalStations,
      activeStations,
      pendingStations,
      weeklyVisits: 0,
      monthlyVisits: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
