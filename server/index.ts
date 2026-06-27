import jwt from "jsonwebtoken";
import { NextRequest } from "./shims/next-server";
import { requestContext, type OutgoingCookie } from "./shims/next-headers";
import connectdb from "@/Utils/api/db/connectDB";
import { SECRET_KEY } from "@/Utils/constants";

// Route handlers — copied verbatim from the client's Next.js app/api tree.
import * as assignment from "@/app/api/v1/assignment/route";
import * as assignmentCustom from "@/app/api/v1/assignment/custom/route";
import * as assignmentFetch from "@/app/api/v1/assignment/fetch/route";
import * as assignmentFetchCandidates from "@/app/api/v1/assignment/fetch-candidates/route";
import * as assignmentGetAttempted from "@/app/api/v1/assignment/get-attempted/route";
import * as assignmentByMonths from "@/app/api/v1/assignment/get-candidates-by-months/route";
import * as assignmentGetNames from "@/app/api/v1/assignment/get-names/route";
import * as contactUs from "@/app/api/v1/contact-us/route";
import * as generateTest from "@/app/api/v1/generate-test/route";
import * as jdApprove from "@/app/api/v1/jd-generator/approve/route";
import * as jdGenerate from "@/app/api/v1/jd-generator/generate/route";
import * as jdParse from "@/app/api/v1/jd-generator/parse/route";
import * as jdRegenerate from "@/app/api/v1/jd-generator/regenerate/route";
import * as jdSet from "@/app/api/v1/jd-generator/set/[id]/route";
import * as submitTest from "@/app/api/v1/submit-test/route";
import * as suggestSubtopics from "@/app/api/v1/suggest-subtopics/route";
import * as users from "@/app/api/v1/users/route";
import * as usersGenerateOtp from "@/app/api/v1/users/generate-otp/route";
import * as usersLogin from "@/app/api/v1/users/login/route";
import * as usersProfile from "@/app/api/v1/users/profile/route";
import * as usersRegister from "@/app/api/v1/users/register/route";
import * as usersResetPass from "@/app/api/v1/users/reset-pass/route";
import * as usersSendRegOtp from "@/app/api/v1/users/send-registration-otp/route";
import * as ipChapters from "@/app/api/v1/interview-prep/chapters/route";
import * as ipChaptersReorder from "@/app/api/v1/interview-prep/chapters/reorder/route";
import * as ipNavTree from "@/app/api/v1/interview-prep/nav-tree/route";
import * as ipPages from "@/app/api/v1/interview-prep/pages/route";
import * as ipPagesReorder from "@/app/api/v1/interview-prep/pages/reorder/route";
import * as ipPagesSearch from "@/app/api/v1/interview-prep/pages/search/route";
import * as ipPageDetail from "@/app/api/v1/interview-prep/pages/[id]/route";
import * as ipPageLike from "@/app/api/v1/interview-prep/pages/[id]/like/route";
import * as ipPageProgress from "@/app/api/v1/interview-prep/pages/[id]/progress/route";
import * as ipPageStatus from "@/app/api/v1/interview-prep/pages/[id]/status/route";
import * as ipSeed from "@/app/api/v1/interview-prep/seed/route";
import * as ipSubjects from "@/app/api/v1/interview-prep/subjects/route";

type Handler = (req: NextRequest, ctx?: unknown) => Response | Promise<Response>;
type MethodMap = Partial<Record<string, Handler>>;

// Static path -> method -> handler. Mirrors the file-based routes one-to-one.
const routes: Record<string, MethodMap> = {
  "/api/v1/assignment": assignment as MethodMap,
  "/api/v1/assignment/custom": assignmentCustom as MethodMap,
  "/api/v1/assignment/fetch": assignmentFetch as MethodMap,
  "/api/v1/assignment/fetch-candidates": assignmentFetchCandidates as MethodMap,
  "/api/v1/assignment/get-attempted": assignmentGetAttempted as MethodMap,
  "/api/v1/assignment/get-candidates-by-months": assignmentByMonths as MethodMap,
  "/api/v1/assignment/get-names": assignmentGetNames as MethodMap,
  "/api/v1/contact-us": contactUs as MethodMap,
  "/api/v1/generate-test": generateTest as MethodMap,
  "/api/v1/jd-generator/approve": jdApprove as MethodMap,
  "/api/v1/jd-generator/generate": jdGenerate as MethodMap,
  "/api/v1/jd-generator/parse": jdParse as MethodMap,
  "/api/v1/jd-generator/regenerate": jdRegenerate as MethodMap,
  "/api/v1/submit-test": submitTest as MethodMap,
  "/api/v1/suggest-subtopics": suggestSubtopics as MethodMap,
  "/api/v1/users": users as MethodMap,
  "/api/v1/users/generate-otp": usersGenerateOtp as MethodMap,
  "/api/v1/users/login": usersLogin as MethodMap,
  "/api/v1/users/profile": usersProfile as MethodMap,
  "/api/v1/users/register": usersRegister as MethodMap,
  "/api/v1/users/reset-pass": usersResetPass as MethodMap,
  "/api/v1/users/send-registration-otp": usersSendRegOtp as MethodMap,
  "/api/v1/interview-prep/chapters": ipChapters as MethodMap,
  "/api/v1/interview-prep/chapters/reorder": ipChaptersReorder as MethodMap,
  "/api/v1/interview-prep/nav-tree": ipNavTree as MethodMap,
  "/api/v1/interview-prep/pages": ipPages as MethodMap,
  "/api/v1/interview-prep/pages/reorder": ipPagesReorder as MethodMap,
  "/api/v1/interview-prep/pages/search": ipPagesSearch as MethodMap,
  "/api/v1/interview-prep/seed": ipSeed as MethodMap,
  "/api/v1/interview-prep/subjects": ipSubjects as MethodMap,
};

// Dynamic-segment routes. Patterns are tried in order, so more specific paths
// (…/pages/[id]/like) must precede the catch-all (…/pages/[id]). Static routes
// above are matched first, so /pages/reorder and /pages/search never fall here.
const DYNAMIC_ROUTES: { pattern: RegExp; mod: MethodMap }[] = [
  { pattern: /^\/api\/v1\/jd-generator\/set\/([^/]+)$/, mod: jdSet as MethodMap },
  {
    pattern: /^\/api\/v1\/interview-prep\/pages\/([^/]+)\/like$/,
    mod: ipPageLike as MethodMap,
  },
  {
    pattern: /^\/api\/v1\/interview-prep\/pages\/([^/]+)\/progress$/,
    mod: ipPageProgress as MethodMap,
  },
  {
    pattern: /^\/api\/v1\/interview-prep\/pages\/([^/]+)\/status$/,
    mod: ipPageStatus as MethodMap,
  },
  {
    pattern: /^\/api\/v1\/interview-prep\/pages\/([^/]+)$/,
    mod: ipPageDetail as MethodMap,
  },
];

// Routes reachable without a bearer token. Everything else requires a valid
// JWT in the Authorization header. Login, signup, and "fetch all assessments"
// are explicitly public; the OTP / reset-password flows are included because
// they are part of login/signup and cannot carry a token yet.
const PUBLIC_ROUTES = new Set<string>([
  "POST /api/v1/users/login",
  "POST /api/v1/users/register",
  "GET /api/v1/assignment", // fetch all assessments
  "POST /api/v1/users/generate-otp",
  "POST /api/v1/users/send-registration-otp",
  "POST /api/v1/users/reset-pass",
]);

function isPublic(method: string, pathname: string): boolean {
  return PUBLIC_ROUTES.has(`${method} ${pathname}`);
}

// Validate the "Authorization: Bearer <token>" header. Returns true when the
// token verifies against SECRET_KEY, false otherwise.
function hasValidBearer(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();
  if (!token) return false;
  try {
    jwt.verify(token, SECRET_KEY as string);
    return true;
  } catch {
    return false;
  }
}

function serializeCookie(c: OutgoingCookie): string {
  const o = c.options ?? {};
  let s = `${c.name}=${encodeURIComponent(c.value)}`;
  if (typeof o.maxAge === "number") s += `; Max-Age=${o.maxAge}`;
  if (typeof o.path === "string") s += `; Path=${o.path}`;
  if (o.httpOnly) s += `; HttpOnly`;
  if (o.secure) s += `; Secure`;
  if (typeof o.sameSite === "string")
    s += `; SameSite=${o.sameSite[0]!.toUpperCase()}${o.sameSite.slice(1)}`;
  return s;
}

// ponytail: reflect-origin CORS with credentials, the minimum that lets a
// browser client on another origin use cookie auth. Lock to an allowlist if
// this is ever exposed beyond the paired client.
function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function dispatch(
  handler: Handler,
  incoming: Request,
  params?: Record<string, string>,
): Promise<Response> {
  const store = { req: incoming, setCookies: [] as OutgoingCookie[] };
  const nextReq = new NextRequest(incoming);
  const ctx = params ? { params: Promise.resolve(params) } : undefined;

  const res = await requestContext.run(store, () => handler(nextReq, ctx));

  if (store.setCookies.length === 0) return res;

  // Re-emit with the collected Set-Cookie headers attached.
  const headers = new Headers(res.headers);
  for (const c of store.setCookies) headers.append("Set-Cookie", serializeCookie(c));
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

await connectdb();

const port = Number(process.env.PORT) || 5000;

Bun.serve({
  port,
  async fetch(req) {
    const origin = req.headers.get("origin");
    const cors = corsHeaders(origin);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const { pathname } = new URL(req.url);

    // Auth gate: anything not in the public allowlist needs a valid bearer token.
    if (!isPublic(req.method, pathname) && !hasValidBearer(req)) {
      const denied = Response.json({ message: "Access denied" }, { status: 401 });
      const headers = new Headers(denied.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(denied.body, { status: 401, headers });
    }

    let handler: Handler | undefined;
    let params: Record<string, string> | undefined;

    const exact = routes[pathname];
    if (exact) {
      handler = exact[req.method];
    } else {
      for (const route of DYNAMIC_ROUTES) {
        const m = route.pattern.exec(pathname);
        if (m) {
          params = { id: m[1]! };
          handler = route.mod[req.method];
          break;
        }
      }
    }

    let res: Response;
    if (!handler) {
      res = Response.json({ message: "Not found" }, { status: 404 });
    } else {
      try {
        res = await dispatch(handler, req, params);
      } catch (error) {
        console.error("Unhandled route error:", error);
        res = Response.json({ message: "Internal server error" }, { status: 500 });
      }
    }

    // Attach CORS to every response.
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
});

console.log(`API server listening on http://localhost:${port}`);
