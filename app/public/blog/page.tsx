// app/public/blog/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PostCard from "@/components/posts/PostCard";

type ApiPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
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

const val = (v: string | null | undefined): string | undefined =>
  v === null || v === undefined ? undefined : v;

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Derive current query values from the URL
  const page = useMemo(() => val(searchParams.get("page")) ?? "1", [searchParams]);
  const limit = useMemo(() => val(searchParams.get("limit")) ?? "9", [searchParams]);
  const category = useMemo(() => val(searchParams.get("category")), [searchParams]);
  const tag = useMemo(() => val(searchParams.get("tag")), [searchParams]);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build API URL from current query
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    return `/api/posts${params.toString() ? `?${params.toString()}` : ""}`;
  }, [page, limit, category, tag]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.message ? ` - ${j.message}` : "";
          } catch {}
          throw new Error(`HTTP ${res.status}${detail}`);
        }
        const json: ApiResponse = await res.json();
        setData(json);
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
  }, [apiUrl]);
  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our latest articles and news
          </p>

          {/* Pagination info */}
          <div className="mt-6 text-sm text-gray-500">
            {!loading && data ? (
              data.totalCount > 0 ? (
                <span>
                  Showing {((data.currentPage - 1) * Number(limit)) + 1} to{" "}
                  {Math.min(data.currentPage * Number(limit), data.totalCount)} of {data.totalCount} articles
                </span>
              ) : (
                <span>No articles found</span>
              )
            ) : (
              <span>Loading…</span>
            )}
          </div>

          {/* Active filters */}
          {!loading && data && (data.filters.category || data.filters.tag) && (
            <div className="mt-4 flex justify-center gap-2">
              {data.filters.category && (
                <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  Category: {data.filters.category}
                </span>
              )}
              {data.filters.tag && (
                <span className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                  Tag: {data.filters.tag}
                </span>
              )}
            </div>
          )}
        </div>
        {error && (
          <div className="text-center py-8 text-red-600">
            ❌ {error}
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post grid */}
        {!loading && !error && data && (
          <>
            {data.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {data.posts.map((post) => (
                  <PostCard key={post.id} post={post as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600">
                  {data.filters.category || data.filters.tag
                    ? "No articles match your search criteria."
                    : "There are no published articles yet."}
                </p>
              </div>
            )}

            {/* Simple pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                {data.hasPreviousPage ? (
                  <a
                    href={buildHref(data.currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </a>
                ) : (
                  <span className="px-4 py-2 border border-transparent text-gray-400">
                    Previous
                  </span>
                )}

                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Page {data.currentPage} of {data.totalPages}
                </span>

                {data.hasNextPage ? (
                  <a
                    href={buildHref(data.currentPage + 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </a>
                ) : (
                  <span className="px-4 py-2 border border-transparent text-gray-400">
                    Next
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
