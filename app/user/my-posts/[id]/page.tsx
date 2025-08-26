"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PostForm from "@/components/posts/PostForm";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryIds: string[];
  tagIds: string[];
  images: Array<{
    url: string;
    alt?: string;
    order: number;
  }>;
}

export default function EditPostPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      toast.error("You must be logged in to edit posts");
      router.push("/login");
      return;
    }

    if (postId) {
      fetchPost();
    }
  }, [session, isSessionLoading, router, postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      
      const postData = await response.json();
      
      // Vérifier que l'utilisateur est l'auteur du post
      if (postData.authorId !== session?.user?.id) {
        toast.error("You can only edit your own posts");
        router.push("/user/my-posts");
        return;
      }
      
      setPost(postData);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Error loading post");
      router.push("/user/my-posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdated = () => {
    toast.success("Post updated successfully");
    router.push("/user/my-posts");
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-40 mb-6" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Post not found.</p>
            <Button className="mt-4" onClick={() => router.push("/user/my-posts")}>
              Back to My Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Button variant="outline" onClick={() => router.push("/user/my-posts")}>
          Back to My Posts
        </Button>
      </div>
      
      <PostForm
        initialData={post}
        mode="edit"
      />
    </div>
  );
}