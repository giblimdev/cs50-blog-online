//@/components/CategoryForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getCategories, Category } from "@/utils/getCategory";
import { useSession } from "@/lib/auth/auth-client"; 

interface CategoryFormProps {
  selected: string[];
  onToggle: (id: string) => void;
  onNewCategory?: (cat: Category) => void;
}

export default function CategoryForm({
  selected,
  onToggle,
  onNewCategory,
}: CategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryOrder, setNewCategoryOrder] = useState(10);
  const { data: session } = useSession(); 

  useEffect(() => {
    (async () => {
      setCategories(await getCategories());
    })();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a category");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCategory, 
          order: newCategoryOrder,
          authorId: session.user.id
        }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat]);
        onNewCategory?.(cat);
        setNewCategory("");
        setNewCategoryOrder(10);
        toast.success("Category added");
      } else {
        const error = await res.json();
        toast.error(error.error || "Error creating category");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Categories</Label>
      <Select onValueChange={(val) => onToggle(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2 mt-4">
        <Label>Add New Category</Label>
        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1"
          />
          <Input
            type="number"
            value={newCategoryOrder}
            onChange={(e) => setNewCategoryOrder(Number(e.target.value))}
            placeholder="Order"
            className="w-20"
          />
          {/* CORRECTION: Ajout de type="button" pour éviter la soumission du formulaire parent */}
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Label>Selected Categories</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              No categories selected
            </span>
          ) : (
            selected.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                <span
                  key={id}
                  className="px-2 py-1 bg-primary/10 rounded text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => onToggle(id)}
                >
                  {cat?.name || id} ✕
                </span>
              );
            })
          )}
        </div>
      </div>
    </div> 
  );
}