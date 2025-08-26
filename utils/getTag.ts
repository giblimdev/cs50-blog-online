// utils/getTag.ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
  order: number;
  categoryId: string;
}

export async function getTags(): Promise<Tag[]> {
  try {
    const res = await fetch("/api/tags", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  } catch (e) {
    console.error("getTags error", e);
    return [];
  }
}
