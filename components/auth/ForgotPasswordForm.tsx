// components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ForgotPasswordValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return true;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Something went wrong");
      }

      // Store the reset link received from API
      if (responseData.resetUrl) {
        setResetLink(responseData.resetUrl);
      }

      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Email sent successfully!</strong>
            <br />
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions to reset your password.
          </AlertDescription>
        </Alert>

        {/* Div to display the sent link - functional */}
        {resetLink && (
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Reset Link (Demo Mode)
            </h3>
            <div className="bg-white p-3 rounded border border-blue-200 mb-3">
              <code className="text-xs text-blue-800 break-all">
                {resetLink}
              </code>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(resetLink)}
                className="flex items-center gap-2"
              >
                <Copy className="h-3 w-3" />
                Copy Link
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(resetLink, "_blank")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-3 w-3" />
                Open Link
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 In production, this link would only be sent via email
            </p>
          </div>
        )}

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setIsSuccess(false);
                setResetLink(null);
              }}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          {...register("email", {
            validate: validateEmail,
          })}
          disabled={isLoading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
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
