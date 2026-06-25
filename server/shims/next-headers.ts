// Shim for `next/headers` so the copied route/controller code runs unchanged
// on a plain Bun server. Next resolves headers()/cookies() from a request-scoped
// async context; we reproduce that with AsyncLocalStorage, populated per request
// by index.ts. Outgoing cookies set via cookies().set/.delete are collected on
// the store and flushed to Set-Cookie headers by the server after the handler.
import { AsyncLocalStorage } from "async_hooks";

export interface OutgoingCookie {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

export interface RequestStore {
  req: Request;
  setCookies: OutgoingCookie[];
}

export const requestContext = new AsyncLocalStorage<RequestStore>();

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key) out[key] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

// Next 15 made these async; auth.ts/controllers `await` them, so we match.
export async function headers(): Promise<Headers> {
  return requestContext.getStore()?.req.headers ?? new Headers();
}

interface CookieEntry {
  name: string;
  value: string;
}

export async function cookies() {
  const store = requestContext.getStore();
  const jar = parseCookieHeader(store?.req.headers.get("cookie") ?? "");
  return {
    get(name: string): CookieEntry | undefined {
      return name in jar ? { name, value: jar[name]! } : undefined;
    },
    set(name: string, value: string, options?: Record<string, unknown>): void {
      store?.setCookies.push({ name, value, options });
    },
    delete(name: string): void {
      store?.setCookies.push({
        name,
        value: "",
        options: { maxAge: 0, path: "/" },
      });
    },
  };
}
