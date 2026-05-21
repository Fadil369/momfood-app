/**
 * ZuZu session management — anonymous-friendly conversation memory.
 *
 *   getOrCreateSession(env, sessionId, lang) → row
 *   appendMessage(env, sessionId, role, content) → message id
 *   recentTurns(env, sessionId, n=8) → [{role, content}]
 *
 * Sessions live in `zuzu_sessions`, turns in `zuzu_messages`. We trim by
 * recency on read (not on write) to keep writes cheap.
 */

import type { Env } from '../_middleware'
import { uuid } from './response'

export interface SessionRow {
  id: string
  user_id: string | null
  language: string
  channel: string
  started_at: string
  ended_at: string | null
}

export async function getOrCreateSession(
  env: Env,
  sessionId: string | null | undefined,
  lang: 'ar' | 'en',
): Promise<SessionRow> {
  if (sessionId) {
    const existing = await env.DB.prepare(
      `SELECT * FROM zuzu_sessions WHERE id = ?`,
    )
      .bind(sessionId)
      .first<SessionRow>()
    if (existing) return existing
  }
  const id = sessionId || uuid()
  await env.DB.prepare(
    `INSERT INTO zuzu_sessions (id, language, channel) VALUES (?, ?, 'web')
     ON CONFLICT(id) DO NOTHING`,
  )
    .bind(id, lang)
    .run()
  const row = await env.DB.prepare(`SELECT * FROM zuzu_sessions WHERE id = ?`)
    .bind(id)
    .first<SessionRow>()
  return row!
}

export async function appendMessage(
  env: Env,
  sessionId: string,
  role: 'user' | 'assistant' | 'tool' | 'system',
  content: string,
): Promise<string> {
  const id = uuid()
  await env.DB.prepare(
    `INSERT INTO zuzu_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)`,
  )
    .bind(id, sessionId, role, content)
    .run()
  return id
}

export async function recentTurns(
  env: Env,
  sessionId: string,
  n = 8,
): Promise<{ role: string; content: string }[]> {
  const { results } = await env.DB.prepare(
    `SELECT role, content FROM zuzu_messages
     WHERE session_id = ? AND role IN ('user','assistant')
     ORDER BY created_at DESC LIMIT ?`,
  )
    .bind(sessionId, n)
    .all<{ role: string; content: string }>()
  return results.reverse()
}
