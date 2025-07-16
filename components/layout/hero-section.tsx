// components/hero-section.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
      {/* Pattern CSS au lieu de SVG */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                BlogHub
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover amazing stories, connect with passionate writers, and
              share your own thoughts in our vibrant community of creators and
              readers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg"
            >
              Start Reading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-blue-600 hover:bg-white font-semibold px-8 py-6 text-lg"
            >
              Write Your Story
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <BookOpen className="h-8 w-8 mb-4 mx-auto text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Rich Content</h3>
              <p className="text-blue-100">
                Explore diverse topics and engaging stories
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <Users className="h-8 w-8 mb-4 mx-auto text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-blue-100">
                Connect with writers and readers worldwide
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <TrendingUp className="h-8 w-8 mb-4 mx-auto text-orange-400" />
              <h3 className="text-xl font-semibold mb-2">Trending</h3>
              <p className="text-blue-100">
                Stay updated with the latest trends
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
