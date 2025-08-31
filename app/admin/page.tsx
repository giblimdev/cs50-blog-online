//@/admin/page.tsx
import CategoryMaster from "@/components/categories/CategoryMaster";
import Header from "@/components/layout/header/Header";
import TagMaster from "@/components/tags/TagMaster";
import React from "react";

export default function page() {
  return (
    <div>
      <div>
        <Header />
      </div>
      <div>
        <CategoryMaster />
      </div>
      <div>
        <TagMaster />
      </div>
    </div>
  );
}
