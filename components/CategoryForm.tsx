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

  useEffect(() => {
    (async () => {
      setCategories(await getCategories());
    })();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat]);
        onNewCategory?.(cat);
        setNewCategory("");
        toast.success("Category added");
      } else {
        toast.error("Error creating category");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-2">
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

      <div className="flex gap-2 mt-2">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selected.map((id) => {
          const cat = categories.find((c) => c.id === id);
          return (
            <span
              key={id}
              className="px-2 py-1 bg-primary/10 rounded text-xs cursor-pointer"
              onClick={() => onToggle(id)}
            >
              {cat?.name || id} ✕
            </span>
          );
        })}
      </div>
    </div>
  );
}