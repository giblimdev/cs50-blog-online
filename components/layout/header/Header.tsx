// components/layout/header/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, User, LogOut, Settings, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/layout/header/Logo";
import Nav from "@/components/layout/header/Nav";
import IsConnected from "@/components/layout/header/IsConnected";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Nav />
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Write Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Link href="/write">
                <PenTool className="h-4 w-4 mr-2" />
                Write
              </Link>
            </Button>

            {/* User Authentication */}
            <IsConnected />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <Nav />

              {/* Mobile Actions */}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-gray-600 hover:text-gray-900"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/write">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write Article
                  </Link>
                </Button>

                <div className="pt-2">
                  <IsConnected />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
