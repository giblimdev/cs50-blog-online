// app/auth/reset-password/page.tsx
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your new password to complete the reset
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
