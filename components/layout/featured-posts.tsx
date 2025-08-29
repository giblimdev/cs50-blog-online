// components/featured-posts.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/posts/PostCard";

// Types aligned with /app/api/posts/route.ts (GET)
type ApiPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  order: number;
  createdAt: string; // JSON -> string
  updatedAt: string; // JSON -> string
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  images: { id: string; url: string; alt: string | null; order: number }[];
  author: { id: string; name: string | null };
};

type ApiResponse = {
  posts: ApiPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: { category: string | null; tag: string | null };
};

export function FeaturedPosts() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Limit to 6 posts to reproduce the previous behavior
        const res = await fetch(`/api/posts?limit=6`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: ApiResponse = await res.json();
        setPosts(data.posts ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "An error occurred while loading the articles.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Recent Stories
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Discover our latest and most engaging content from our community of writers
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 sm:px-0 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse h-64"
            >
              <div className="h-32 bg-gray-200" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}

        {/* Posts list */}
        {!loading &&
          posts.map((post) => (
            <div key={post.id} className="group">
              {/* PostCard expects a Post object with relations; the API fields are compatible */}
              <PostCard post={post as any} />
            </div>
          ))}
      </div>

      <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
        <Button asChild variant="outline" size="lg" className="text-sm sm:text-base">
          <Link href="/public/blog">View All Posts</Link>
        </Button>
      </div>
    </div>
  );
}
