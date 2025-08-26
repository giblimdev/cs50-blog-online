//@/app/user/write/page.tsx
import React from 'react';
import PostForm from '@/components/posts/PostForm';

export default function WritePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a new post</h1>
        <PostForm />
      </div>
    </div>
  );
} 