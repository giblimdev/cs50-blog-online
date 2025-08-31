//@/components/tags/TagMaster.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import TagForm from "./Form";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: {
    posts: number;
  };
}

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetch("/api/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

export default function TagMaster() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [movingTag, setMovingTag] = useState<string | null>(null);

  // Load tags
  const loadTags = async () => {
    setIsLoading(true);
    try {
      const data = await getTags();
      // Sort by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      setTags(sortedData);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Open the form to add a tag
  const handleAddTag = () => {
    setEditingTag(null);
    setShowForm(true);
  };

  // Open the form to edit a tag
  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  // Close the form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  // Delete a tag
  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Error during deletion");
        return;
      }

      // Reload tags after deletion
      await loadTags();
    } catch (error) {
      console.error("Error during deletion:", error);
      alert("Error deleting the tag");
    }
  };

  // Move a tag
  const handleMoveTag = async (tagId: string, direction: "up" | "down") => {
    setMovingTag(tagId);

    try {
      console.log("Moving tag:", tagId, direction);

      const response = await fetch(`/api/tags/${tagId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        alert(data.error || "Error changing order");
        return;
      }

      console.log("Move successful:", data);
      await loadTags();
    } catch (error) {
      console.error("Error:", error);
      alert("Could not change the order");
    } finally {
      setMovingTag(null);
    }
  };

  // Callback after form save
  const handleFormSuccess = () => {
    handleCloseForm();
    loadTags();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tag Management</h1>
        <button
          onClick={handleAddTag}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add a tag
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tags found.</p>
          <p>Click "Add a tag" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-11 gap-4 px-6 py-3 bg-gray-50 border-b font-semibold text-sm text-gray-700">
            <div className="col-span-1">Order</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-2">Posts</div>
            <div className="col-span-2">Actions</div>
          </div>

          {tags.map((tag, index) => {
            const canMoveUp = index > 0;
            const canMoveDown = index < tags.length - 1;
            const isMoving = movingTag === tag.id;

            return (
              <div
                key={tag.id}
                className="grid grid-cols-11 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Order */}
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                    {tag.order}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-3 flex items-center">
                  <span className="font-medium">{tag.name}</span>
                </div>

                {/* Slug */}
                <div className="col-span-3 flex items-center">
                  <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {tag.slug}
                  </span>
                </div>

                {/* Number of posts */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded">
                    {tag._count?.posts || 0} post(s)
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-1">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMoveTag(tag.id, "up")}
                    disabled={!canMoveUp || isMoving}
                    className={`p-2 rounded transition-colors ${
                      !canMoveUp || isMoving
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    }`}
                    title="Move Up"
                  >
                    {isMoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => handleMoveTag(tag.id, "down")}
                    disabled={!canMoveDown || isMoving}
                    className={`p-2 rounded transition-colors ${
                      !canMoveDown || isMoving
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    }`}
                    title="Move Down"
                  >
                    {isMoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEditTag(tag)}
                    disabled={isMoving}
                    className={`p-2 rounded transition-colors ${
                      isMoving
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    }`}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={isMoving}
                    className={`p-2 rounded transition-colors ${
                      isMoving
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-red-600 hover:text-red-800 hover:bg-red-100"
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for the form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingTag ? "Edit Tag" : "Add a Tag"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Using the TagForm component */}
            <TagForm
              tag={editingTag}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
