// app/about/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code,
  Users,
  BookOpen,
  Target,
  Heart,
  Github,
  Twitter,
  Mail,
  Award,
  Lightbulb,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-8">
                <Code className="h-16 w-16 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About CS50 Blog
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Welcome to CS50 Blog, your destination for discovering the latest
              tech innovations, learning new skills, and joining a passionate
              community of developers and students.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg opacity-90">
                    To make programming education accessible to everyone, share
                    knowledge, and build an inclusive community where everyone
                    can grow and thrive in the world of technology.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What We Do */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              What We Do
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl">Tutorials & Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Detailed tutorials covering all aspects of programming, from
                    beginner to advanced level.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Lightbulb className="h-8 w-8 text-yellow-500 mb-2" />
                  <CardTitle className="text-xl">Practical Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Hands-on projects to practice your skills and build your
                    portfolio with real-world applications.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-xl">Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    A collaborative space where developers share experiences,
                    help each other, and grow together.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technologies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Technologies We Cover
            </h2>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "JavaScript",
                "TypeScript",
                "React",
                "Next.js",
                "Node.js",
                "Python",
                "Django",
                "Flask",
                "PostgreSQL",
                "MongoDB",
                "Docker",
                "AWS",
                "Git",
                "CSS",
                "HTML",
                "Tailwind CSS",
                "Prisma",
                "GraphQL",
                "REST API",
                "Machine Learning",
              ].map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="px-4 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  100+
                </div>
                <p className="text-gray-600">Published Articles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  50K+
                </div>
                <p className="text-gray-600">Monthly Readers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  25+
                </div>
                <p className="text-gray-600">Contributors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  15+
                </div>
                <p className="text-gray-600">Categories</p>
              </div>
            </div>
          </div>

          {/* CS50 Connection */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <Award className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Inspired by CS50</h2>
                  <p className="text-lg opacity-90">
                    Our blog is inspired by Harvard's CS50 philosophy: making
                    computer science accessible, encouraging creativity, and
                    building a collaborative learning community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Values
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Passion</h3>
                <p className="text-gray-600">
                  We are passionate about technology and continuous learning.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Inclusion</h3>
                <p className="text-gray-600">
                  We believe technology should be accessible to everyone.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Impact</h3>
                <p className="text-gray-600">
                  We aim to create a positive impact in the tech community.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gray-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Join Our Community
                </h2>
                <p className="text-gray-600 mb-6">
                  Ready to start your coding journey or take your skills to the
                  next level?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Link href="/blog">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Read Our Blog
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">
                      <Mail className="mr-2 h-5 w-5" />
                      Get in Touch
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Follow us on social media</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
