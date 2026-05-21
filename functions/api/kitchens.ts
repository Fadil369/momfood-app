// GET /api/kitchens — list active kitchens
// GET /api/kitchens?city=Riyadh
import { ok, fail } from '../_lib/response'
import type { Env } from '../_middleware'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const city = url.searchParams.get('city')
  const country = url.searchParams.get('country')

  let q = 'SELECT id, name_ar, name_en, slug, city, country, cover_image, is_subsidised FROM kitchens WHERE is_active = 1'
  const binds: unknown[] = []
  if (city) {
    q += ' AND city = ?'
    binds.push(city)
  }
  if (country) {
    q += ' AND country = ?'
    binds.push(country)
  }
  q += ' ORDER BY name_ar LIMIT 100'

  try {
    const { results } = await env.DB.prepare(q).bind(...binds).all()
    return ok({ kitchens: results })
  } catch (e) {
    return fail(`db error: ${(e as Error).message}`, 500, 'DB_ERROR')
  }
}
