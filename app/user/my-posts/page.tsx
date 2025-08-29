// @/app/user/my-posts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PostCard from "@/components/posts/PostCard";
import type { Post, Category, Tag, Image, User as PrismaUser } from "@/lib/generated/prisma/client";

type MyPostWithRelations = Post & {
  categories: Category[]; 
  tags: Tag[];
  images: Image[];
  author: PrismaUser;
};

export default function MyPostsPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<MyPostWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      toast.error("You must be logged in to view your posts");
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      fetchMyPosts();
    }
  }, [session, isSessionLoading, router]);

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/myPost");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const userPosts: MyPostWithRelations[] = await res.json();
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error loading your posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    router.push("/user/write");
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ); 
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Button onClick={handleCreatePost}>Create New Post</Button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven't created any posts yet.
          </p>
          <Button onClick={handleCreatePost}>Create Your First Post</Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center">
            <span className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} •{" "}
              {posts.filter((post) => post.published).length} published •{" "}
              {posts.filter((post) => !post.published).length} drafts
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard post={post} />


                {!post.published && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      Draft
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
