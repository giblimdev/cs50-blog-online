// @/components/posts/PostActionsClient.tsx
"use client";

import { Edit, Trash2, X } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PostForm from "./PostForm";

interface PostActionsClientProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    published: boolean;
    order: number;
    authorId?: string;
    author: { id: string; name: string | null };
    categories: Array<{ id: string }>;
    tags: Array<{ id: string }>;
    images: Array<{ id: string; url: string; alt?: string | null; order: number }>;
  };
}

export default function PostActionsClient({ post }: PostActionsClientProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Author = current user
  const isAuthor = useMemo(() => {
    const sid = session?.user?.id ? String(session.user.id) : null;
    const aid = post.authorId ? String(post.authorId) : post.author?.id ? String(post.author.id) : null;
    return Boolean(sid && aid && sid === aid);
  }, [session?.user?.id, post.authorId, post.author?.id]);

  // Common redirect
  const goToMyPosts = () => {
    router.push("/user/my-posts");
    router.refresh(); // reloads SSR data without a full page reload
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Error during deletion");
        alert("Error deleting the post");
        return;
      }
      // Immediate client navigation
      goToMyPosts();
    } catch (err) {
      console.error("Error:", err);
      alert("Error deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    // After successful PUT via PostForm => redirect to my posts
    goToMyPosts();
  };

  const handleEditCancel = () => setIsEditing(false);

  if (isPending || !isAuthor) return null;

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDeleting ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          } text-white`}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
        </button>
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Edit Post</h2>
              <button
                onClick={handleEditCancel}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <PostForm
                initialData={{
                  id: post.id,
                  title: post.title,
                  slug: post.slug,
                  excerpt: post.excerpt || "",
                  content: post.content,
                  published: post.published,
                  order: post.order,
                  categoryIds: post.categories.map((c) => c.id),
                  tagIds: post.tags.map((t) => t.id),
                  images: post.images.map((img) => ({
                    url: img.url,
                    alt: img.alt || undefined,
                    order: img.order,
                  })),
                }}
                mode="edit"
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}