//@/components/categories/CategoryMaster.tsx

"use client";

import React, { useState, useEffect } from "react";
import { getCategories, Category } from "@/utils/getCategory";
import CategoryForm from "@/components/categories/Form";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function CategoryMaster() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [movingCategory, setMovingCategory] = useState<string | null>(null);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      // Sort by order
      const sortedData = data.sort((a, b) => a.order - b.order);
      setCategories(sortedData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Open form to add a category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  // Open form to edit a category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Close the form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Error during deletion");
        return;
      }

      // Reload categories after deletion
      await loadCategories();
    } catch (error) {
      console.error("Error during deletion:", error);
      alert("Error deleting the category");
    }
  };

  // Move a category
  const handleMoveCategory = async (
    categoryId: string,
    direction: "up" | "down"
  ) => {
    setMovingCategory(categoryId);

    try {
      console.log("Moving category:", categoryId, direction);

      const response = await fetch(`/api/categories/${categoryId}/move`, {
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
      await loadCategories();
    } catch (error) {
      console.error("Error:", error);
      alert("Could not change the order");
    } finally {
      setMovingCategory(null);
    }
  };

  // Callback after form save
  const handleFormSuccess = () => {
    handleCloseForm();
    loadCategories();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={handleAddCategory}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add a category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No categories found.</p>
          <p>Click "Add a category" to get started.</p>
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

          {categories.map((category, index) => {
            const canMoveUp = index > 0;
            const canMoveDown = index < categories.length - 1;
            const isMoving = movingCategory === category.id;

            return (
              <div
                key={category.id}
                className="grid grid-cols-11 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Order */}
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                    {category.order}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-3 flex items-center">
                  <span className="font-medium">{category.name}</span>
                </div>

                {/* Slug */}
                <div className="col-span-3 flex items-center">
                  <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </span>
                </div>

                {/* Number of posts */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    {category._count?.posts || 0} post(s)
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-1">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMoveCategory(category.id, "up")}
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
                    onClick={() => handleMoveCategory(category.id, "down")}
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
                    onClick={() => handleEditCategory(category)}
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
                    onClick={() => handleDeleteCategory(category.id)}
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
                {editingCategory ? "Edit Category" : "Add a Category"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
