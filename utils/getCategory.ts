// //@/utils/getCategories.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: {
    posts: number;
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    console.log("🔄 Starting to fetch categories...");
    
    const res = await fetch("/api/categories", { cache: "no-store" });
    
    console.log("📡 Response status:", res.status);
    console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.error("❌ Failed to fetch categories - HTTP status:", res.status);
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    } 
    
    const categories = await res.json();
    console.log("✅ Categories fetched successfully:", categories.length, "items");
    console.log("📊 Categories data:", categories);
    
    return categories;
  } catch (error) {
    console.error("💥 getCategories error:", error);
    console.error("💥 Error type:", typeof error);
    console.error("💥 Error message:", error instanceof Error ? error.message : String(error));
    
    // Return empty array as fallback
    console.log("🔄 Returning empty array as fallback");
    return [];
  }
}
