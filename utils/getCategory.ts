// utils/getCategory.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (e) {
    console.error("getCategories error", e);
    return [];
  }
}
