// @/app/api/tags/[id]/move/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fonction utilitaire pour réinitialiser les ordres
async function resetTagOrders() {
  console.log("🔧 Resetting all tag orders...");

  const allTags = await prisma.tag.findMany({
    orderBy: { id: "asc" }, // Utiliser l'ID au lieu de createdAt
  });

  // Réassigner des ordres séquentiels
  await prisma.$transaction(
    allTags.map((tag, index) =>
      prisma.tag.update({
        where: { id: tag.id },
        data: { order: index + 1 },
      })
    )
  );

  console.log("✅ Tag orders reset successfully");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { direction } = await req.json();

    console.log(`🚀 Moving tag ${id} ${direction}`);

    // Récupérer tous les tags
    const allTags = await prisma.tag.findMany({
      orderBy: { order: "asc" },
    });

    console.log(
      "📋 Current tags order:",
      allTags.map((t) => `${t.name}(${t.order})`).join(", ")
    );

    // Vérifier si tous les tags ont le même ordre
    const uniqueOrders = new Set(allTags.map((t) => t.order));
    if (uniqueOrders.size === 1) {
      console.log("⚠️ All tags have the same order, resetting orders first...");
      await resetTagOrders();

      // Recharger les tags après reset
      const updatedTags = await prisma.tag.findMany({
        orderBy: { order: "asc" },
      });
      console.log(
        "📋 Tags after reset:",
        updatedTags.map((t) => `${t.name}(${t.order})`).join(", ")
      );
    }

    // Reprendre la logique normale
    const currentTags = await prisma.tag.findMany({
      orderBy: { order: "asc" },
    });

    const currentIndex = currentTags.findIndex((tag) => tag.id === id);

    if (currentIndex === -1) {
      console.log(`❌ Tag ${id} not found`);
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    console.log(`📊 Moving from index ${currentIndex} to ${newIndex}`);

    // Vérifier les limites
    if (newIndex < 0 || newIndex >= currentTags.length) {
      console.log(`⚠️ Cannot move ${direction}, already at edge`);
      return NextResponse.json({
        success: true,
        info: `Already at the ${direction === "up" ? "top" : "bottom"}`,
      });
    }

    // Réorganiser le tableau
    const reorderedTags = [...currentTags];
    const [movedTag] = reorderedTags.splice(currentIndex, 1);
    reorderedTags.splice(newIndex, 0, movedTag);

    console.log(
      "🔄 New order will be:",
      reorderedTags.map((t) => t.name).join(", ")
    );

    // Mettre à jour tous les ordres
    await prisma.$transaction(
      reorderedTags.map((tag, index) => {
        const newOrder = index + 1;
        console.log(`🔧 Setting ${tag.name} to order ${newOrder}`);
        return prisma.tag.update({
          where: { id: tag.id },
          data: { order: newOrder },
        });
      })
    );

    // Vérifier le résultat final
    const finalTags = await prisma.tag.findMany({
      orderBy: { order: "asc" },
    });
    console.log(
      "📋 Final order:",
      finalTags.map((t) => `${t.name}(${t.order})`).join(", ")
    );

    console.log(`✅ Move operation completed successfully`);

    return NextResponse.json({
      success: true,
      message: `Tag moved ${direction} successfully`,
    });
  } catch (error) {
    console.error("💥 Error moving tag:", error);

    if (error instanceof Error) {
      console.error("💥 Error message:", error.message);
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
