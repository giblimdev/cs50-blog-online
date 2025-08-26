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
import { getTags, Tag } from "@/utils/getTag";

interface TagFormProps {
  selected: string[];
  onToggle: (id: string) => void;
  onNewTag?: (tag: Tag) => void;
}

export default function TagForm({ selected, onToggle, onNewTag }: TagFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [catForTag, setCatForTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setCategories(await getCategories());
      setTags(await getTags());
    })();
  }, []);

  const handleAdd = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag }),
      });
      if (res.ok) {
        const tag = await res.json();
        setTags((prev) => [...prev, tag]);
        onNewTag?.(tag);
        setNewTag("");
        toast.success("Tag added");
      } else {
        toast.error("Error creating tag");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <Select onValueChange={(val) => onToggle(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a tag" />
        </SelectTrigger>
        <SelectContent>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 mt-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag"
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selected.map((id) => {
          const tag = tags.find((t) => t.id === id);
          return (
            <span
              key={id}
              className="px-2 py-1 bg-secondary rounded text-xs cursor-pointer"
              onClick={() => onToggle(id)}
            >
              {tag?.name || id} ✕
            </span>
          );
        })}
      </div>
    </div>
  );
}