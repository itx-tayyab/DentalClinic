import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

const HOP_BY_HOP = new Set(["host", "connection", "content-length"]);

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { message: "API_BASE_URL is not configured on the server." },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const target = `${baseUrl.replace(/\/+$/, "")}/${path
    .map(encodeURIComponent)
    .join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "The clinic API is unavailable. Please try again." },
      { status: 502 },
    );
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export const dynamic = "force-dynamic";
