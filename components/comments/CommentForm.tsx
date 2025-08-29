// components/comments/CommentForm.tsx
'use client';

import { useSession } from '@/lib/auth/auth-client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const { data: session, isPending, error, refetch } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !session.user) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    if (!content.trim()) { 
      alert('Le commentaire ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          authorId: session.user.id, // Envoi de l'ID utilisateur via le formulaire
        }),
      });

      if (response.ok) {
        setContent('');
        router.refresh(); // Rafraîchir la page pour afficher le nouveau commentaire
      } else {
        throw new Error('Erreur lors de l\'envoi du commentaire');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l\'envoi du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Erreur de chargement de session
          </p>
          <Button onClick={() => refetch()} className="mt-2">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Veuillez vous connecter pour commenter
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ajouter un commentaire</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre commentaire"
              rows={4}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publication...' : 'Publier le commentaire'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}