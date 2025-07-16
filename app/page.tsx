// app/page.tsx
import { Suspense } from "react";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedPosts } from "@/components/layout/featured-posts";
import { CategoriesGrid } from "@/components/layout/categories-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<PostsSkeleton />}>
            <FeaturedPosts />
          </Suspense>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}
