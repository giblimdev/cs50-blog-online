// components/featured-posts.tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { JSX } from "react";

interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  author: {
    name: string;
    image: string | null;
  };
  categories: {
    name: string;
    slug: string;
  }[];
  images: {
    url: string;
    alt: string | null;
  }[];
}

export async function FeaturedPosts(): Promise<JSX.Element> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      categories: {
        select: {
          name: true,
          slug: true,
        },
      },
      images: {
        select: {
          url: true,
          alt: true,
        },
        take: 1,
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return (
    <div className="w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Recent Stories
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Discover our latest and most engaging content from our community of
          writers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
        {posts.map((post, index) => (
          <div key={post.id} className="group">
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:shadow-blue-100">
              <CardHeader className="p-0">
                <div className="relative h-48 sm:h-52 md:h-48 overflow-hidden">
                  {post.images.length > 0 ? (
                    <Image
                      src={post.images[0].url}
                      alt={post.images[0].alt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl sm:text-5xl md:text-6xl font-bold">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2 flex-wrap">
                    {post.categories.slice(0, 2).map((category) => (
                      <Badge
                        key={category.slug}
                        variant="secondary"
                        className="bg-white/90 text-gray-800 text-xs backdrop-blur-sm"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 sm:p-6 pt-0">
                <Button asChild className="w-full group text-sm sm:text-base">
                  <Link href={`/blog/${post.slug}`}>
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="text-sm sm:text-base"
        >
          <Link href="/blog">
            View All Posts
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
