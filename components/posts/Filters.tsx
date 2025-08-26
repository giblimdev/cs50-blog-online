// @/components/posts/Filters.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter, Loader2 } from 'lucide-react';
import { getCategories, Category } from '@/utils/getCategory';
import { getTags, Tag } from '@/utils/getTag';

interface FiltersProps {
  currentCategory?: string;
  currentTag?: string;
}

export default function Filters({ currentCategory, currentTag }: FiltersProps) {
  const router = useRouter();
  const [category, setCategory] = useState(currentCategory || '');
  const [tag, setTag] = useState(currentTag || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiltersData() {
      try {
        setLoading(true);
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags()
        ]);
        
        setCategories(categoriesData);
        setTags(tagsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Erreur lors du chargement des filtres');
      } finally {
        setLoading(false);
      }
    }

    fetchFiltersData();
  }, []);

  const hasFilters = category || tag;

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to first page when applying filters
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    router.push(`/public/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    setCategory('');
    setTag('');
    router.push('/public/blog');
  };

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-gray-50 rounded-lg flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        <span>Chargement des filtres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center text-red-500">
        {error}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="ml-4"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtrer les articles</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name} {cat._count?.posts ? `(${cat._count.posts})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par tag" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.slug}>
                  #{t.name} {t._count?.posts ? `(${t._count.posts})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1">
              Appliquer
            </Button>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtres actifs :</span>
            {category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Catégorie: {categories.find(c => c.slug === category)?.name}
                <button
                  onClick={() => setCategory('')}
                  className="ml-1.5 rounded-full flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {tag && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tag: #{tags.find(t => t.slug === tag)?.name}
                <button
                  onClick={() => setTag('')}
                  className="ml-1.5 rounded-full flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}