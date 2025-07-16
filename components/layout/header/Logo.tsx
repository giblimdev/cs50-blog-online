// components/layout/header/Logo.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
        <BookOpen className="h-5 w-5 text-white" />
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold text-gray-900">CS50 Blog</h1>
        <p className="text-xs text-gray-500 -mt-1">Modern Tech Stories</p>
      </div>
    </Link>
  );
}
