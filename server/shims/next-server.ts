// Shim for `next/server`. NextResponse/NextRequest are thin wrappers over the
// Web Fetch Response/Request, which is exactly what Bun.serve speaks — so the
// copied handlers return real Responses and read real Requests unchanged.

export class NextResponse extends Response {
  static override json(data: unknown, init?: ResponseInit): NextResponse {
    const headers = new Headers(init?.headers);
    headers.set("content-type", "application/json");
    return new NextResponse(JSON.stringify(data), { ...init, headers });
  }
}

export class NextRequest extends Request {
  readonly nextUrl: URL;
  readonly cookies: {
    get(name: string): { name: string; value: string } | undefined;
  };

  constructor(input: Request, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(this.url);

    const header = this.headers.get("cookie") ?? "";
    const jar: Record<string, string> = {};
    for (const part of header.split(";")) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      const key = part.slice(0, idx).trim();
      if (key) jar[key] = decodeURIComponent(part.slice(idx + 1).trim());
    }
    this.cookies = {
      get: (name) => (name in jar ? { name, value: jar[name]! } : undefined),
    };
  }
}
