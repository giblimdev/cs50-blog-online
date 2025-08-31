//@/components/categories/Form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/utils/getCategory";

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // INITIALIZE THE FORM WITH THE CATEGORY DATA TO EDIT
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        order: category.order,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        order: 10,
      });
    }
    setErrors({});
  }, [category]);

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

    // CONVERT TO UPPERCASE FOR THE "name" FIELD
    if (name === "name") {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : processedValue,
    }));

    // AUTOMATICALLY GENERATE THE SLUG WHEN THE NAME CHANGES
    if (name === "name") {
      const autoSlug = generateSlug(value); // Use the original value for the slug
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
      newErrors.name = "NAME IS REQUIRED";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "SLUG IS REQUIRED";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "SLUG CAN ONLY CONTAIN LOWERCASE LETTERS, NUMBERS, AND HYPHENS";
    }

    if (formData.order < 0) {
      newErrors.order = "ORDER MUST BE A POSITIVE NUMBER";
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
      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";

      const method = category ? "PUT" : "POST";

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
            setErrors({ name: "THIS CATEGORY NAME ALREADY EXISTS" });
          } else if (result.error.includes("slug")) {
            setErrors({ slug: "THIS SLUG ALREADY EXISTS" });
          }
        } else {
          setErrors({ general: result.error || "AN ERROR OCCURRED" });
        }
        return;
      }

      // SUCCESS
      onSuccess();
    } catch (error) {
      console.error("ERROR DURING SAVE:", error);
      setErrors({ general: "CONNECTION ERROR. PLEASE TRY AGAIN." });
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
          CATEGORY NAME *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
            errors.name ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="EX: TECHNOLOGY"
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
          SLUG (URL) *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
            errors.slug ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="EX: technology"
          disabled={isLoading}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          THE SLUG IS AUTOMATICALLY GENERATED FROM THE NAME. YOU CAN MODIFY IT
          IF NEEDED.
        </p>
      </div>

      {/* ORDER FIELD */}
      <div>
        <label
          htmlFor="order"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DISPLAY ORDER
        </label>
        <input
          type="number"
          id="order"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          min="0"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.order ? "border-red-300" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.order && (
          <p className="mt-1 text-sm text-red-600">{errors.order}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          THE SMALLER THE NUMBER, THE HIGHER THE CATEGORY WILL APPEAR ON THE
          LIST.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              ></circle>
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              ></path>
            </svg>
          )}
          {category ? "UPDATE" : "CREATE"}
        </button>
      </div>
    </form>
  );
}
