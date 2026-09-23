"use server";

import { SignJWT, jwtVerify } from "jose";
import { keyJWT } from "@/lib/utils";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(keyJWT);
}

export async function decrypt(input) {
  if (!input) return null;
  const { payload } = await jwtVerify(input, keyJWT, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function deleteCookie(cookiesArr) {
  const cookieStore = await cookies();
  cookiesArr.forEach((cookie) => cookieStore.delete(cookie));
}

function sessionCookieOptions(maxAge) {
  const isProd = ["production", "demo", "stage"].includes(
    process.env.NEXT_PUBLIC_ENVIRONMENT,
  );

  return {
    maxAge,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  };
}

export async function setSessionCookie(sessionData, userId, roleId = 3) {
  const cookieStore = await cookies();

  const isProd = ["production", "demo", "stage"].includes(
    process.env.NEXT_PUBLIC_ENVIRONMENT,
  );

  const maxAge = isProd
    ? 60 * 60 // 1 hour in seconds
    : 365 * 24 * 60 * 60; // 1 year in seconds

  const session = await encrypt(sessionData);
  const options = sessionCookieOptions(maxAge);

  cookieStore.set("tkr_usr_session", session, options);

  cookieStore.set("tkr_usr_role", roleId, options);

  cookieStore.set("tkr_usr_id", userId, options);

  // Non-sensitive presence flag so client components can check "is someone
  // logged in" without needing access to the (now HttpOnly) session cookie.
  cookieStore.set("tkr_has_session", "1", { maxAge, sameSite: "lax" });

  revalidateTag("role-layout-data");
  revalidateTag("dashboard-home-data");
  // revalidatePath("/app/paciente");
  revalidatePath("/app/[role]", "page");

  return true;
}

export async function getSessionUserData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("tkr_usr_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
