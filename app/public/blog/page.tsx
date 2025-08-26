// app/public/blog/page.tsx
import { Suspense } from 'react';
import PostCard from '@/components/posts/PostCard';
import { Post, Category, Tag, Image, User as PrismaUser } from '@/lib/generated/prisma/client';

// Type pour la réponse de l'API
interface ApiResponse {
  posts: (Post & {
    categories: Category[];
    tags: Tag[];
    images: Image[];
    author: PrismaUser;
  })[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: {
    category: string | null;
    tag: string | null;
  };
}

// Fonction pour récupérer les posts
async function getPosts(searchParams: { [key: string]: string | string[] | undefined }): Promise<ApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Construction des paramètres de recherche
  const params = new URLSearchParams();
  
  if (searchParams.page) {
    params.set('page', String(searchParams.page));
  }
  if (searchParams.limit) {
    params.set('limit', String(searchParams.limit));
  }
  if (searchParams.category) {
    params.set('category', String(searchParams.category));
  }
  if (searchParams.tag) {
    params.set('tag', String(searchParams.tag));
  }

  const url = `${baseUrl}/api/posts${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 }, // Revalider toutes les 60 secondes
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des posts: ${response.status}`);
  }

  return response.json();
}

// Composant de chargement
function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Interface pour les props de la page
interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Composant principal de la page
export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Résoudre la promesse des searchParams
  const resolvedSearchParams = await searchParams;
  
  try {
    const data = await getPosts(resolvedSearchParams);

    return (
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="container mx-auto px-4">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez nos derniers articles et actualités
            </p>
            
            {/* Informations de pagination */}
            <div className="mt-6 text-sm text-gray-500">
              {data.totalCount > 0 ? (
                <span>
                  Affichage de {((data.currentPage - 1) * 9) + 1} à {Math.min(data.currentPage * 9, data.totalCount)} sur {data.totalCount} articles
                </span>
              ) : (
                <span>Aucun article trouvé</span>
              )}
            </div>

            {/* Filtres actifs */}
            {(data.filters.category || data.filters.tag) && (
              <div className="mt-4 flex justify-center gap-2">
                {data.filters.category && (
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    Catégorie: {data.filters.category}
                  </span>
                )}
                {data.filters.tag && (
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    Tag: {data.filters.tag}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Grille des posts */}
          {data.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-gray-600">
                {data.filters.category || data.filters.tag
                  ? "Aucun article ne correspond à vos critères de recherche."
                  : "Il n'y a pas encore d'articles publiés."}
              </p>
            </div>
          )}

          {/* Pagination simple */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              {data.hasPreviousPage && (
                <a
                  href={`?page=${data.currentPage - 1}${resolvedSearchParams.category ? `&category=${resolvedSearchParams.category}` : ''}${resolvedSearchParams.tag ? `&tag=${resolvedSearchParams.tag}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </a>
              )}
              
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Page {data.currentPage} sur {data.totalPages}
              </span>
              
              {data.hasNextPage && (
                <a
                  href={`?page=${data.currentPage + 1}${resolvedSearchParams.category ? `&category=${resolvedSearchParams.category}` : ''}${resolvedSearchParams.tag ? `&tag=${resolvedSearchParams.tag}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Suivant
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error);
    
    return (
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600">
              Une erreur est survenue lors du chargement des articles.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

// Metadata pour la page
export const metadata = {
  title: 'Blog',
  description: 'Découvrez nos derniers articles et actualités',
};

// Génération des paramètres statiques
export async function generateStaticParams() {
  // Vous pouvez pré-générer les premières pages pour améliorer les performances
  return [
    { page: '1' },
    { page: '2' },
    { page: '3' },
  ];
}