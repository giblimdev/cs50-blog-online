// components/auth/ResetPasswordForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Reset token is missing or invalid");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one lowercase, one uppercase, and one number";
    }
    return null;
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(null);

    // Revalidate confirm password if it's already filled
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(
      confirmPassword,
      password
    );

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      setIsSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !isLoading) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This reset link is invalid or has expired.{" "}
          <Link href="/auth/forgot-password" className="underline">
            Request a new link
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Password updated successfully!</strong>
            <br />
            Your password has been changed. You will be redirected to the
            sign-in page.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Redirecting automatically in 3 seconds...
          </p>
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 underline"
          >
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading}
            className={passwordError ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="text-sm text-red-600">{passwordError}</p>
        )}
        <p className="text-xs text-gray-500">
          At least 8 characters with one lowercase, one uppercase, and one
          number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            disabled={isLoading}
            className={confirmPasswordError ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPasswordError && (
          <p className="text-sm text-red-600">{confirmPasswordError}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !token}>
        {isLoading ? "Updating..." : "Update Password"}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to sign in
        </Link>
      </div>
    </form>
  );
}
