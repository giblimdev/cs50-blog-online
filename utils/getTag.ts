// //@/utils/getTags.ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: {
    posts: number;
  };
}

export async function getTags(): Promise<Tag[]> {
  try {
    console.log("🔄 Starting to fetch tags...");
    
    const res = await fetch("/api/tags", { cache: "no-store" });
    
    console.log("📡 Response status:", res.status);
    console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      console.error("❌ Failed to fetch tags - HTTP status:", res.status);
      throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`);
    }
    
    const tags = await res.json();
    console.log("✅ Tags fetched successfully:", tags.length, "items");
    console.log("📊 Tags data:", tags);
    
    return tags;
  } catch (error) {
    console.error("💥 getTags error:", error);
    console.error("💥 Error type:", typeof error);
    console.error("💥 Error message:", error instanceof Error ? error.message : String(error));
    
    // Return empty array as fallback
    console.log("🔄 Returning empty array as fallback");
    return [];
  }
}
