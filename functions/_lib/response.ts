// Shared helpers for Pages Functions
// Path: functions/_lib/response.ts (re-exported by route files)

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  })
}

export function ok(data: unknown): Response {
  return json({ ok: true, data })
}

export function fail(message: string, status = 400, code?: string): Response {
  return json({ ok: false, error: { message, code: code ?? 'ERROR' } }, { status })
}

export function uuid(): string {
  return crypto.randomUUID()
}

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
