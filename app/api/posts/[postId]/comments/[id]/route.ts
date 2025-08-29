// app/api/posts/[postId]/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string; id: string }> }
) {
  try {
    const { postId, id } = await context.params;
    
    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } 
}