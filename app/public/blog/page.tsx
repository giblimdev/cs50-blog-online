// app/public/blog/page.tsx

import PostCard from '@/components/posts/PostCard';

// Types alignés avec /api/posts (dates en string)
interface ApiPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  images: { id: string; url: string; alt: string | null; order: number }[];
  author: { id: string; name: string | null };
}

interface ApiResponse {
  posts: ApiPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: { category: string | null; tag: string | null };
}

// Helper: normalise string | string[] | undefined -> string | undefined
const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v ?? undefined; // typé explicitement

// URL de base (si on choisit de fetch l’API côté serveur)
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL!;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

type SearchParams = { [key: string]: string | string[] | undefined };

// Récupération via Route Handler (garde l’API actuelle)
async function getPosts(sp: SearchParams): Promise<ApiResponse> {
  const params = new URLSearchParams();

  const page = first(sp.page);
  const limit = first(sp.limit);
  const category = first(sp.category);
  const tag = first(sp.tag);

  if (page) params.set('page', page);           // string OK
  if (limit) params.set('limit', limit);        // string OK
  if (category) params.set('category', category); // string OK
  if (tag) params.set('tag', tag);              // string OK

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/posts${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    // Surface un message utile si l’API renvoie une erreur JSON
    let detail = '';
    try {
      const j = await response.json();
      detail = j?.message ? ` - ${j.message}` : '';
    } catch {}
    throw new Error(`Error fetching posts: ${response.status}${detail}`);
  }

  return response.json();
}

// Next 15: searchParams est une Promise et doit être await
interface BlogPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const sp = await searchParams; // obligatoire en Next 15

  try {
    const data = await getPosts(sp);

    return (
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our latest articles and news
            </p>

            {/* Pagination info */}
            <div className="mt-6 text-sm text-gray-500">
              {data.totalCount > 0 ? (
                <span>
                  Showing {((data.currentPage - 1) * 9) + 1} to {Math.min(data.currentPage * 9, data.totalCount)} of {data.totalCount} articles
                </span>
              ) : (
                <span>No articles found</span>
              )}
            </div>

            {/* Active filters */}
            {(data.filters.category || data.filters.tag) && (
              <div className="mt-4 flex justify-center gap-2">
                {data.filters.category && (
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    Category: {data.filters.category}
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

          {/* Post grid */}
          {data.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">
                {data.filters.category || data.filters.tag
                  ? 'No articles match your search criteria.'
                  : 'There are no published articles yet.'}
              </p>
            </div>
          )}

          {/* Simple pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              {data.hasPreviousPage && (
                <a
                  href={`?page=${data.currentPage - 1}${first(sp.category) ? `&category=${first(sp.category)}` : ''}${first(sp.tag) ? `&tag=${first(sp.tag)}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </a>
              )}

              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Page {data.currentPage} of {data.totalPages}
              </span>

              {data.hasNextPage && (
                <a
                  href={`?page=${data.currentPage + 1}${first(sp.category) ? `&category=${first(sp.category)}` : ''}${first(sp.tag) ? `&tag=${first(sp.tag)}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading posts:', error);

    return (
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading error</h3>
            <p className="text-gray-600">An error occurred while loading the articles.</p>
          </div>
        </div>
      </div>
    );
  }
}

// Metadata
export const metadata = {
  title: 'Blog',
  description: 'Discover our latest articles and news',
};
