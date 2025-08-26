// app/not-found.tsx
// Custom 404 page – English version, modern UI with shadcn/ui and lucide-react

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

export default function NotFound() {
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
              Page not found
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Oops! It looks like this page has vanished into cyberspace. But don't worry, you can discover plenty of other interesting content here!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to homepage
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse the blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
