// components/layout/header/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Categories", href: "/categories" },
  { name: "Tags", href: "/tags" },
  { name: "About", href: "/about" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-2 lg:space-y-0">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-blue-600 px-3 py-2 rounded-md lg:px-0 lg:py-0",
            pathname === item.href
              ? "text-blue-600 bg-blue-50 lg:bg-transparent"
              : "text-gray-600 hover:bg-gray-50 lg:hover:bg-transparent"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
