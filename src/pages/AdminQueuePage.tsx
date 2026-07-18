// Admin queue — read-only view over leads ZuZu has already collected
// (kitchen_leads, order_intents, callbacks). Gated by ADMIN_TOKEN, entered
// once and held in sessionStorage for the tab's lifetime, never persisted.

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TOKEN_KEY = 'zuzu-admin-token'

interface KitchenLead {
  id: string
  name: string
  phone: string | null
  city: string | null
  specialty: string | null
  notes: string | null
  status: string
  created_at: string
}
interface OrderIntent {
  id: string
  dish: string
  servings: number | null
  city: string | null
  phone: string | null
  notes: string | null
  status: string
  created_at: string
}
interface Callback {
  id: string
  name: string | null
  phone: string
  reason: string | null
  preferred_window: string | null
  status: string
  created_at: string
}
interface QueueData {
  kitchen_leads: KitchenLead[]
  order_intents: OrderIntent[]
  callbacks: Callback[]
}

async function fetchQueue(token: string): Promise<QueueData> {
  const res = await fetch('/api/admin/queue', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('unauthorized')
  if (res.status === 503) throw new Error('not_configured')
  if (!res.ok) throw new Error('request_failed')
  const body = await res.json()
  return body.data as QueueData
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variant: BadgeProps['variant'] =
    status === 'new' || status === 'open' || status === 'queued'
      ? 'accent'
      : status === 'onboarded' || status === 'fulfilled' || status === 'done'
      ? 'success'
      : 'outline'
  return (
    <Badge variant={variant} size="sm">
      {status}
    </Badge>
  )
}

const Section: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({
  title,
  count,
  children,
}) => (
  <div className="mb-10">
    <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
      {title} <span className="text-sm font-normal text-muted-foreground">({count})</span>
    </h2>
    {count === 0 ? (
      <p className="text-sm text-muted-foreground">Nothing here yet.</p>
    ) : (
      <div className="overflow-x-auto rounded-lg border border-border">{children}</div>
    )}
  </div>
)

const AdminQueuePage: React.FC = () => {
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [data, setData] = useState<QueueData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = window.sessionStorage.getItem(TOKEN_KEY)
    if (stored) setToken(stored)
  }, [])

  const load = useCallback(async (t: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchQueue(t)
      setData(result)
      window.sessionStorage.setItem(TOKEN_KEY, t)
    } catch (e) {
      const msg = (e as Error).message
      setError(msg)
      if (msg === 'unauthorized') window.sessionStorage.removeItem(TOKEN_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) load(token)
  }, [token, load])

  if (!token || error === 'unauthorized') {
    return (
      <div dir="ltr" className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card variant="premium" className="w-full max-w-sm">
          <CardContent className="p-6 space-y-4">
            <h1 className="font-display font-bold text-xl">ZuZu — Admin Queue</h1>
            <p className="text-sm text-muted-foreground">
              Enter the admin token to view kitchen leads, order intents, and callback requests.
            </p>
            <Input
              type="password"
              placeholder="Admin token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputToken) setToken(inputToken)
              }}
            />
            {error === 'unauthorized' && (
              <p className="text-sm text-destructive">Wrong token — try again.</p>
            )}
            <Button className="w-full" disabled={!inputToken} onClick={() => setToken(inputToken)}>
              Enter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div dir="ltr" className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl">ZuZu — Admin Queue</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.sessionStorage.removeItem(TOKEN_KEY)
              setToken('')
              setData(null)
            }}
          >
            Sign out
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground mb-6">Loading…</p>}
        {error && error !== 'unauthorized' && (
          <p className="text-sm text-destructive mb-6">
            {error === 'not_configured'
              ? 'ADMIN_TOKEN is not configured on the server yet.'
              : 'Could not load the queue — try refreshing.'}
          </p>
        )}

        {data && (
          <>
            <Section title="Kitchen leads" count={data.kitchen_leads.length}>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-start p-3">Name</th>
                    <th className="text-start p-3">Phone</th>
                    <th className="text-start p-3">City</th>
                    <th className="text-start p-3">Specialty</th>
                    <th className="text-start p-3">Status</th>
                    <th className="text-start p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.kitchen_leads.map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="p-3">{l.name}</td>
                      <td className="p-3">{l.phone ?? '—'}</td>
                      <td className="p-3">{l.city ?? '—'}</td>
                      <td className="p-3">{l.specialty ?? '—'}</td>
                      <td className="p-3"><StatusBadge status={l.status} /></td>
                      <td className="p-3 text-muted-foreground">{l.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Order intents" count={data.order_intents.length}>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-start p-3">Dish</th>
                    <th className="text-start p-3">Servings</th>
                    <th className="text-start p-3">City</th>
                    <th className="text-start p-3">Phone</th>
                    <th className="text-start p-3">Status</th>
                    <th className="text-start p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.order_intents.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="p-3">{o.dish}</td>
                      <td className="p-3">{o.servings ?? '—'}</td>
                      <td className="p-3">{o.city ?? '—'}</td>
                      <td className="p-3">{o.phone ?? '—'}</td>
                      <td className="p-3"><StatusBadge status={o.status} /></td>
                      <td className="p-3 text-muted-foreground">{o.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Callback requests" count={data.callbacks.length}>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-start p-3">Name</th>
                    <th className="text-start p-3">Phone</th>
                    <th className="text-start p-3">Reason</th>
                    <th className="text-start p-3">Preferred window</th>
                    <th className="text-start p-3">Status</th>
                    <th className="text-start p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.callbacks.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="p-3">{c.name ?? '—'}</td>
                      <td className="p-3">{c.phone}</td>
                      <td className="p-3">{c.reason ?? '—'}</td>
                      <td className="p-3">{c.preferred_window ?? '—'}</td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3 text-muted-foreground">{c.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminQueuePage
