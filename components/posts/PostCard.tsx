// @/components/posts/PostCard.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Post, Category, Tag, Image, User as PrismaUser } from '@/lib/generated/prisma/client';

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
}

export default function PostCard({ post }: PostCardProps) {
  const featuredImage = post.images?.[0];

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

  return (
    <article className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2">
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
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
              <ArrowRight className="w-4 h-4 text-gray-700" />
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
      </Link>

      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </article>
  );
}
