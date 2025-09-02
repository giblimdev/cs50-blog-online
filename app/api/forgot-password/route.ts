// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Interface for data validation
interface ForgotPasswordRequest {
  email: string;
}

// Function to validate the email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to generate a reset token
function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

// Simulate a user database for the demo
async function findUserByEmail(email: string) {
  // For the demo, we accept all valid emails
  return { id: 1, email };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    // Validate the data
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if the user exists (for the demo, we accept everything)
    const user = await findUserByEmail(email.toLowerCase());

    // Generate a reset token
    const resetToken = generateResetToken();

    // For demonstration, we log the token and the URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/reset-password?token=${resetToken}`;

    console.log("=== DEMO MODE ===");
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=================");

    // Simulate an email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return the response with the token for the demo
    return NextResponse.json({
      message: "Reset link sent successfully",
      // For demo purposes only - never do this in production!
      resetUrl: resetUrl,
      token: resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        message: `Demo error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed - Use POST" },
    { status: 405 }
  );
}
