// Catchall — returns a friendly 404 for unknown /api/* paths.
import { fail } from '../_lib/response'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  return fail(`No route for ${request.method} ${url.pathname}`, 404, 'NOT_FOUND')
}
