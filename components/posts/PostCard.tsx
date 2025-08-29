// @/components/posts/PostCard.tsx
"use client";
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { Post, Category, Tag, Image, User as PrismaUser } from '@/lib/generated/prisma/client';
import Link from 'next/link';
import { useSession } from '@/lib/auth/auth-client';
import { useState, useEffect } from 'react';

// Type avec les relations incluses et createdAt flexible
type PostWithRelations = Post & {
  categories: Category[];
  tags: Tag[];
  images: Image[]; 
  author: PrismaUser;
} & {
  createdAt: Date | string; // Permettre les deux types
};

interface PostCardProps {
  post: PostWithRelations;
  onDelete?: (postId: string) => void; // Callback optionnel pour la suppression
  onEdit?: (postId: string) => void; // Callback optionnel pour l'édition
}

export default function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const { data: session, isPending } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // État pour contrôler l'affichage du formulaire
  const [isAuthor, setIsAuthor] = useState(false);
  const featuredImage = post.images?.[0];

  // Vérification de l'auteur
  useEffect(() => {
    const authorId = post.authorId || post.author?.id;
    
    if (session?.user?.id && authorId) {
      const sessionUserId = String(session.user.id);
      const postAuthorId = String(authorId);
      setIsAuthor(sessionUserId === postAuthorId);
    } else {
      setIsAuthor(false);
    }
  }, [session, post.authorId, post.author?.id]);

  // Conversion flexible de la date
  const createdAtDate =
    typeof post.createdAt === 'string'
      ? new Date(post.createdAt) 
      : post.createdAt;

  const formattedDate = createdAtDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Estimation du temps de lecture
  const readingTime = post.excerpt
    ? Math.max(1, Math.ceil(post.excerpt.length / 200))
    : 3;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(post.id);
        } else {
          window.location.reload();
        }
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    
    // Appeler le callback parent si fourni
    if (onEdit) {
      onEdit(post.id);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Rafraîchir la page ou les données
    window.location.reload();
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Afficher un indicateur de chargement pendant le chargement de la session
  if (isPending) {
    return (
      <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2">
        
        
        <Link href={`/public/blog/${post.slug}`} className="block">
          {/* Image principale avec overlay gradient */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {featuredImage ? (
              <img
                src={featuredImage.url}
                alt={featuredImage.alt || post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
                <div className="text-6xl opacity-30">📝</div>
              </div>
            )}

            {/* Overlay avec effet glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

            {/* Badge catégorie flottant */}
            {post.categories.length > 0 && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0 shadow-lg backdrop-blur-sm">
                  {post.categories[0].name}
                </Badge>
              </div>
            )}

            {/* Icône de lecture */}
            <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Titre */}
            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
              {post.title}
            </h2>

            {/* Extrait */}
            {post.excerpt && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    #{tag.name}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs text-gray-400 bg-gray-50/50 rounded-full">
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Métadonnées */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {(post.author.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {post.author.name || 'Anonyme'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <time dateTime={createdAtDate.toISOString()}>
                        {formattedDate}
                      </time>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{readingTime} min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut de publication */}
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    post.published ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </Link>
      </div>

      {isEditing && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Modifier l'article</h2>
        <button
          onClick={handleEditCancel}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    
    </div>
  </div>
)}
    </>
  );
}