// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Interface pour la validation des données
interface ForgotPasswordRequest {
  email: string;
}

// Fonction pour valider l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour générer un token de réinitialisation
function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

// Simuler une base de données d'utilisateurs pour la démo
async function findUserByEmail(email: string) {
  // Pour la démo, on accepte tous les emails valides
  return { id: 1, email };
}

export async function POST(request: NextRequest) {
  try {
    // Parser le body de la requête
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    // Validation des données
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

    // Vérifier si l'utilisateur existe (pour la démo, on accepte tout)
    const user = await findUserByEmail(email.toLowerCase());

    // Générer un token de réinitialisation
    const resetToken = generateResetToken();

    // Pour la démonstration, on log le token et l'URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/reset-password?token=${resetToken}`;

    console.log("=== DEMO MODE ===");
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=================");

    // Simuler un délai d'envoi d'email
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Retourner la réponse avec le token pour la démo
    return NextResponse.json({
      message: "Reset link sent successfully",
      // Pour la démo uniquement - ne jamais faire ça en production !
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
