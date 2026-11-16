import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/session";

function passwordsMatch(candidate: string, expected: string): boolean {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  if (candidateBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(candidateBytes, expectedBytes);
}

function safeNextPath(value: FormDataEntryValue | null): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = form.get("password");
  const nextPath = safeNextPath(form.get("next"));
  const expected = process.env.DASHBOARD_PASSWORD;

  if (
    !expected ||
    typeof password !== "string" ||
    !passwordsMatch(password, expected)
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    if (nextPath !== "/dashboard") loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const session = await createSession(expected);
  const response = NextResponse.redirect(
    new URL(nextPath, request.url),
    303,
  );

  response.cookies.set({
    name: SESSION_COOKIE,
    value: session.value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}
