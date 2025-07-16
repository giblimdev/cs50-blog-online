// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Code,
  Home,
  Lightbulb,
} from "lucide-react";
import prisma from "@/lib/prisma";

async function getRandomPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return posts;
  } catch (error) {
    return [];
  }
}

async function getPopularCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      take: 5,
    });
    return categories;
  } catch (error) {
    return [];
  }
}

export default async function NotFound() {
  const [recentPosts, categories] = await Promise.all([
    getRandomPosts(),
    getPopularCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="relative">
              <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6">
                  <Code className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8 mb-4">
              Page Not Found
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Oops! Il semblerait que cette page ait disparu dans le
              cyberespace. Mais ne vous inquiétez pas, nous avons plein d'autres
              contenus passionnants à vous proposer !
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Retour à l'accueil
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Parcourir le blog
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Code Animation */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gray-100 rounded-lg p-6 font-mono text-sm">
              <div className="text-red-600 mb-2">
                <span className="text-blue-600">console</span>.
                <span className="text-purple-600">error</span>
                <span className="text-gray-600">(</span>
                <span className="text-green-600">
                  "HTTP 404: Page not found"
                </span>
                <span className="text-gray-600">);</span>
              </div>
              <div className="text-gray-600">
                <span className="text-blue-600">// TODO</span>: Rediriger vers
                du contenu intéressant
              </div>
            </div>
          </div>

          {/* Recent Posts Section */}
          {recentPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                Découvrez nos derniers articles
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={category.slug}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link href={`/blog/${post.slug}`}>Lire l'article</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Explorez nos catégories
              </h2>

              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="px-4 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <Link href={`/categories/${category.slug}`}>
                      {category.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
