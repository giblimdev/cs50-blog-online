// components/layout/header/IsConnected.tsx
"use client";

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
import { User, LogOut, Settings, PenTool, UserCircle } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";

export default function IsConnected() {
  const { data: session, isLoading } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (isLoading) {
    return (
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="justify-start lg:justify-center text-gray-600 hover:text-gray-900"
        >
          <Link href="/login">
            <User className="h-4 w-4 mr-2 lg:mr-0" />
            <span className="lg:hidden">Login</span>
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="justify-start lg:justify-center bg-blue-600 hover:bg-blue-700"
        >
          <Link href="/signup">
            <span>Sign Up</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full lg:h-10 lg:w-auto lg:rounded-md lg:px-3"
        >
          <Avatar className="h-8 w-8 lg:h-6 lg:w-6">
            <AvatarImage
              src={session.user.image || undefined}
              alt={session.user.name || ""}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:block ml-2 text-sm font-medium">
            {session.user.name}
          </span>
          {session.user.emailVerified && (
            <Badge
              variant="secondary"
              className="hidden lg:block absolute -top-1 -right-1 h-3 w-3 p-0 bg-green-100 text-green-600"
            >
              ✓
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user.image || undefined}
              alt={session.user.name || ""}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/my-posts" className="cursor-pointer">
            <PenTool className="mr-2 h-4 w-4" />
            My Posts
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 hover:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
