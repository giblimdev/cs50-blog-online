//@/components/tags/Form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "./TagMaster";
import { Loader2 } from "lucide-react";

interface TagFormProps {
  tag?: Tag | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // INITIALIZE THE FORM WITH THE TAG DATA TO EDIT
  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        slug: tag.slug,
        order: tag.order,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        order: 10,
      });
    }
    setErrors({});
  }, [tag]);

  // AUTOMATICALLY GENERATE THE SLUG FROM THE NAME
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // REMOVE ACCENTS
      .replace(/[^a-z0-9\s-]/g, "") // KEEP ONLY LETTERS, NUMBERS, SPACES AND HYPHENS
      .replace(/\s+/g, "-") // REPLACE SPACES WITH HYPHENS
      .replace(/-+/g, "-") // REPLACE MULTIPLE HYPHENS WITH A SINGLE ONE
      .trim()
      .replace(/^-+|-+$/g, ""); // REMOVE LEADING/TRAILING HYPHENS
  };

  // HANDLE CHANGES IN THE FIELDS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let processedValue = value;

    // CONVERT TO LOWERCASE FOR THE "name" FIELD
    if (name === "name") {
      processedValue = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : processedValue,
    }));

    // AUTOMATICALLY GENERATE THE SLUG WHEN THE NAME CHANGES
    if (name === "name") {
      const autoSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        slug: autoSlug,
      }));
    }

    // CLEAR THE ERROR OF THE MODIFIED FIELD
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // VALIDATE THE FORM
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.order < 0) {
      newErrors.order = "Order must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT THE FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = tag ? `/api/tags/${tag.id}` : "/api/tags";

      const method = tag ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // HANDLE SPECIFIC API ERRORS
        if (response.status === 409) {
          if (result.error.includes("name")) {
            setErrors({ name: "This tag name already exists" });
          } else if (result.error.includes("slug")) {
            setErrors({ slug: "This slug already exists" });
          }
        } else {
          setErrors({ general: result.error || "An error occurred" });
        }
        return;
      }

      // SUCCESS
      onSuccess();
    } catch (error) {
      console.error("Error during save:", error);
      setErrors({ general: "Connection error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* GENERAL ERROR */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* NAME FIELD */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tag Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 lowercase ${
            errors.name ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="ex: react"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* SLUG FIELD */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Slug (URL) *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm ${
            errors.slug ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="ex: react"
          disabled={isLoading}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The slug is automatically generated from the name. You can modify it
          if needed.
        </p>
      </div>

      {/* ORDER FIELD */}
      <div>
        <label
          htmlFor="order"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Display Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          min="0"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.order ? "border-red-300" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.order && (
          <p className="mt-1 text-sm text-red-600">{errors.order}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The smaller the number, the higher the tag will appear on the list.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
        >
          {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
          {tag ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
