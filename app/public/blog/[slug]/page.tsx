// app/public/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, MessageSquare, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import CommentForm from "@/components/comments/CommentForm";
import Comment from "@/components/comments/Comment";
import PostActionsClient from "@/components/posts/PostActionsClient";
interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Function to fetch the post from the database
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: true,
      tags: true,
      images: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return post;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Resolve the params promise
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  } // Flexible date conversion

  const createdAtDate =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  const formattedDate = createdAtDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }); // Reading time estimation

  const readingTime = post.content
    ? Math.max(1, Math.ceil(post.content.split(" ").length / 200))
    : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          
          <Link
            href="/public/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
            to articles 
          </Link>
       <PostActionsClient post={post} />
        </div>
        {post.images.length > 0 && (
          <div className="rounded-xl overflow-hidden mb-8">
            <img
              src={post.images[0].url}
              alt={post.images[0].alt || post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
 {category.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
 {post.title}          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            
            <div className="flex items-center">
             <User className="w-4 h-4 mr-1" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center">
               <Calendar className="w-4 h-4 mr-1" />
              <time dateTime={createdAtDate.toISOString()}>
              {formattedDate}
                            </time>
             
            </div>
            <div className="flex items-center">
 <Clock className="w-4 h-4 mr-1" />
              <span>{readingTime} min read</span>
            </div>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                >
         #{tag.name}
                </span>
              ))}
        
            </div>
          )}
        
        </header>
        
        <article className="prose max-w-none mb-12">
 <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <section className="mb-12">
          <div className="flex items-center mb-6">
<MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
Comments ({post.comments.length})
            </h2>
          </div>
<CommentForm postId={post.id} />
          {/* Comment list */}
          {post.comments.length > 0 ? (
            <div className="space-y-6">
             
              {post.comments.map((comment) => (
                <Comment
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  content={comment.content}
                  createdAt={comment.createdAt}
                  postId={post.id}
                />
              ))}
             </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
             Be the first to comment on this article!            </p>
          )}
        </section>
      </div>
    </div>
  );
}
