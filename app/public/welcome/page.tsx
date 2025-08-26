// app/auth/welcome/page.tsx
"use client";

import { useSession, signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, User, FileText, Loader2 } from "lucide-react";

export default function WelcomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      // router.push("/login");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // router.push("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome message */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}!
            </h2>
            <p className="text-lg text-gray-600">
              You are now logged in to your CS50 Blog
            </p>
          </div>

          {/* User information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Member since {new Date(user.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? "Email verified" : "Email not verified"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Session information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>ID:</strong> {session.session.id}
                  </p>
                  <p>
                    <strong>Last updated:</strong>{" "}
                    {new Date(user.updatedAt).toLocaleDateString("en-US")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/write" className="w-full">
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Write an article
                  </Button>
                </Link>
                <Link href="/my-posts" className="w-full">
                  <Button variant="outline" className="w-full">
                    My posts
                  </Button>
                </Link>
                <Link href="/profile" className="w-full">
                  <Button variant="outline" className="w-full">
                    Edit profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Encouragement message */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Ready to start your blogging journey?
                </h3>
                <p className="text-blue-700 mb-4">
                  Explore all the features of your CS50 Blog
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/write">
                    <Button>Create a post</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}