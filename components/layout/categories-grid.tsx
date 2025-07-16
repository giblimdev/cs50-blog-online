// components/categories-grid.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export async function CategoriesGrid() {
  const categories = await prisma.category.findMany({
    orderBy: {
      order: "asc",
    },
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <h3 className="text-lg font-semibold">{category.name}</h3>
          </CardHeader>
          <CardContent>
            <Link href={`/categories/${category.slug}`}>
              <Badge
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                Voir les articles
              </Badge>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
