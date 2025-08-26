// @/components/posts/PostForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CategoryForm from "@/components/CategoryForm";
import TagForm from "@/components/TagForm";
import { Category } from "@/utils/getCategory";
import { Tag } from "@/utils/getTag";
import { useSession } from "@/lib/auth/auth-client"; 

interface ImageData {
  url: string;
  alt?: string;
  order: number;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  order: number;
  categoryIds: string[];
  tagIds: string[];
  images: ImageData[];
}

interface PostFormProps {
  initialData?: Partial<PostFormData & { id: string }>;
  mode?: "create" | "edit";
}

export default function PostForm({ initialData, mode = "create" }: PostFormProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession(); // Remplacez status par isPending
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    published: initialData?.published || false,
    order: initialData?.order || 10,
    categoryIds: initialData?.categoryIds || [], 
    tagIds: initialData?.tagIds || [],
    images: initialData?.images || [],
  });

  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    if (!isPending && !session) { // Vérifiez si la session est chargée et si l'utilisateur n'est pas connecté
      toast.error("You must be logged in to create or edit posts");
      router.push("/login");
    }
  }, [session, isPending, router]); // Ajoutez session et isPending aux dépendances

  // Automatic slug generation from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // File to base64 conversion
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Image management
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      const newImages: ImageData[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // File type validation
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }

        // Size validation (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const base64 = await convertToBase64(file);
        const nextOrder = Math.max(...formData.images.map(img => img.order), 0) + 1 + i;
        
        newImages.push({
          url: base64,
          alt: file.name.split('.')[0],
          order: nextOrder
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      toast.success(`${newImages.length} image(s) added`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error uploading images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageAltChange = (index: number, alt: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, alt } : img
      )
    }));
  };

  const handleImageOrderChange = (index: number, order: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, order } : img
      )
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success("Image removed");
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  const moveImageDown = (index: number) => {
    if (index === formData.images.length - 1) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const handleNewCategory = (category: Category) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: [...prev.categoryIds, category.id]
    }));
  };

  const handleNewTag = (tag: Tag) => {
    setFormData(prev => ({
      ...prev,
      tagIds: [...prev.tagIds, tag.id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    // Vérifier que l'utilisateur est connecté
    if (!session?.user?.id) {
      toast.error("You must be logged in to create or edit posts");
      return;
    }

    setIsLoading(true);

    try {
      const url = mode === "edit" && initialData?.id 
        ? `/api/posts/${initialData.id}` 
        : "/api/posts";
      
      const method = mode === "edit" ? "PUT" : "POST";

      // Préparer les données à envoyer, en incluant l'authorId
      const postData = {
        ...formData,
        authorId: session.user.id // Ajouter l'authorId depuis la session
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success(mode === "edit" ? "Post updated" : "Post created");
        router.push(`/posts/${post.slug}`);
        router.refresh();
      } else {
        const error = await res.json();
        toast.error(error.message || "Error saving post");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Redirection gérée par useEffect
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="post-slug"
          />
          <p className="text-sm text-muted-foreground">
            Automatically generated from the title
          </p>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief summary of the post"
            rows={3}
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Accepted formats: JPG, PNG, GIF, WebP (max 5MB per image)
            </p>
          </div>

          {/* Image List */}
          {formData.images.length > 0 && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Post Images ({formData.images.length})</h4>
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt || `Image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor={`alt-${index}`}>Alt text</Label>
                      <Input
                        id={`alt-${index}`}
                        type="text"
                        value={image.alt || ""}
                        onChange={(e) => handleImageAltChange(index, e.target.value)}
                        placeholder="Image description"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`order-${index}`}>Order</Label>
                      <Input
                        id={`order-${index}`}
                        type="number"
                        value={image.order}
                        onChange={(e) => handleImageOrderChange(index, parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-20"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveImageUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveImageDown(index)}
                      disabled={index === formData.images.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Article content (Markdown supported)"
            rows={15}
            required
          />
        </div>

        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="order">Display order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 10 }))}
            min="1"
          />
        </div>

        {/* Categories */}
        <CategoryForm
          selected={formData.categoryIds}
          onToggle={handleCategoryToggle}
          onNewCategory={handleNewCategory}
        />

        {/* Tags */}
        <TagForm
          selected={formData.tagIds}
          onToggle={handleTagToggle}
          onNewTag={handleNewTag}
        />

        {/* Published */}
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
          />
          <Label htmlFor="published">Publish post</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "edit" ? "Update" : "Create Post"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}