// lib/auth/auth-serveur.ts
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Récupère la session côté serveur
 * @returns Session utilisateur ou null si non connecté
 */
export async function getServerSession() {
  try {
    const rawHeaders = await headers();
    const stdHeaders = new Headers();
    for (const [key, value] of rawHeaders.entries()) {
      stdHeaders.append(key, value);
    }
    const session = await auth.api.getSession({
      headers: stdHeaders,
    });

    return session;
  } catch (error) {
    console.error("Erreur lors de la récupération de la session:", error);
    return null;
  }
}

/**
 * Récupère la session côté serveur avec redirection automatique si non connecté
 * @param redirectTo - URL de redirection si non connecté (défaut: "/login")
 * @returns Session utilisateur (garantie d'être non null)
 */
export async function requireServerSession(redirectTo: string = "/login") {
  const session = await getServerSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

/**
 * Récupère uniquement les informations utilisateur côté serveur
 * @returns Données utilisateur ou null si non connecté
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Récupère les informations utilisateur avec redirection automatique si non connecté
 * @param redirectTo - URL de redirection si non connecté (défaut: "/login")
 * @returns Données utilisateur (garantie d'être non null)
 */
export async function requireServerUser(redirectTo: string = "/login") {
  const session = await requireServerSession(redirectTo);
  return session.user;
}

/**
 * Vérifie si l'utilisateur est connecté côté serveur
 * @returns true si connecté, false sinon
 */
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

/**
 * Vérifie si l'utilisateur a vérifié son email
 * @returns true si email vérifié, false sinon ou si non connecté
 */
export async function isEmailVerified() {
  const user = await getServerUser();
  return user?.emailVerified || false;
}

/**
 * Récupère l'ID de l'utilisateur connecté
 * @returns ID utilisateur ou null si non connecté
 */
export async function getCurrentUserId() {
  const user = await getServerUser();
  return user?.id || null;
}

/**
 * Middleware helper pour vérifier l'authentification
 * @param request - NextRequest
 * @returns Session ou null
 */
export async function getSessionFromRequest(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la session depuis la requête:",
      error
    );
    return null;
  }
}
