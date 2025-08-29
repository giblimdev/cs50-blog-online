// components/comments/Comment.tsx
"use client";
import { Card, CardContent } from '@/components/ui/card';
import { User, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useSession } from '@/lib/auth/auth-client';
import { useState } from 'react';

interface CommentProps {
  id: string;
  author?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  content: string;
  createdAt: Date | string;
  postId: string;
}

export default function Comment({ id, author, content, createdAt, postId }: CommentProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page or update the parent state
        window.location.reload();
      } else {
        console.error('Error during deletion');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if the user can delete the comment
  const canDelete = session?.user?.id === author?.id;

  return (
    <Card key={id}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {author?.image ? (
              <Image
                src={author.image}
                alt={`Avatar of ${author.name}`}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>

          {/* Comment body */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {author?.name || 'Anonymous'}
                </h3>
                <span className="text-sm text-gray-500">
                  {date.toLocaleDateString('en-US')}
                </span>
              </div>
              
              {/* Conditional delete button */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-gray-700">{content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}