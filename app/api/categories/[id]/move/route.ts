// @/app/api/categories/[id]/move/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fonction utilitaire pour réinitialiser les ordres des catégories
async function resetCategoryOrders() {
  console.log("🔧 Resetting all category orders...");

  const allCategories = await prisma.category.findMany({
    orderBy: { id: "asc" }, // Utiliser l'ID pour un ordre cohérent
  });

  // Réassigner des ordres séquentiels
  await prisma.$transaction(
    allCategories.map((category, index) =>
      prisma.category.update({
        where: { id: category.id },
        data: { order: index + 1 },
      })
    )
  );

  console.log("✅ Category orders reset successfully");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { direction } = await req.json();

    console.log(`🚀 Moving category ${id} ${direction}`);

    // Récupérer toutes les catégories
    const allCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    console.log(
      "📋 Current categories order:",
      allCategories.map((c) => `${c.name}(${c.order})`).join(", ")
    );

    // Vérifier si toutes les catégories ont le même ordre
    const uniqueOrders = new Set(allCategories.map((c) => c.order));
    if (uniqueOrders.size === 1) {
      console.log(
        "⚠️ All categories have the same order, resetting orders first..."
      );
      await resetCategoryOrders();

      // Recharger les catégories après reset
      const updatedCategories = await prisma.category.findMany({
        orderBy: { order: "asc" },
      });
      console.log(
        "📋 Categories after reset:",
        updatedCategories.map((c) => `${c.name}(${c.order})`).join(", ")
      );
    }

    // Reprendre la logique normale
    const currentCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    const currentIndex = currentCategories.findIndex(
      (category) => category.id === id
    );

    if (currentIndex === -1) {
      console.log(`❌ Category ${id} not found`);
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    console.log(`📊 Moving from index ${currentIndex} to ${newIndex}`);

    // Vérifier les limites
    if (newIndex < 0 || newIndex >= currentCategories.length) {
      console.log(`⚠️ Cannot move ${direction}, already at edge`);
      return NextResponse.json({
        success: true,
        info: `Already at the ${direction === "up" ? "top" : "bottom"}`,
      });
    }

    // Réorganiser le tableau
    const reorderedCategories = [...currentCategories];
    const [movedCategory] = reorderedCategories.splice(currentIndex, 1);
    reorderedCategories.splice(newIndex, 0, movedCategory);

    console.log(
      "🔄 New order will be:",
      reorderedCategories.map((c) => c.name).join(", ")
    );

    // Mettre à jour tous les ordres
    await prisma.$transaction(
      reorderedCategories.map((category, index) => {
        const newOrder = index + 1;
        console.log(`🔧 Setting ${category.name} to order ${newOrder}`);
        return prisma.category.update({
          where: { id: category.id },
          data: { order: newOrder },
        });
      })
    );

    // Vérifier le résultat final
    const finalCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    console.log(
      "📋 Final order:",
      finalCategories.map((c) => `${c.name}(${c.order})`).join(", ")
    );

    console.log(`✅ Move operation completed successfully`);

    return NextResponse.json({
      success: true,
      message: `Category moved ${direction} successfully`,
    });
  } catch (error) {
    console.error("💥 Error moving category:", error);

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
