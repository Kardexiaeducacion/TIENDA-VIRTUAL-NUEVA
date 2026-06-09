'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Notification = {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  order_id?: string
}

export function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} días`
}

export function useNotifications(userId: string | null | undefined, limit = 20, channelId = 'default') {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const unreadCount = notifs.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!userId) return;

    let cancelled = false
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
          
        if (cancelled) return
        if (error) {
          setLoadError(error.message)
          return
        }
        setLoadError(null)
        if (data) setNotifs(data as Notification[])
      } catch {
        if (!cancelled) setLoadError('No se pudieron cargar las notificaciones')
      }
    }
    load()
    return () => { cancelled = true }
  }, [userId, limit, supabase])

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${channelId}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new as Notification, ...prev].slice(0, limit))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, limit, channelId, supabase])

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    
    // Update optimistically
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }, [notifs, supabase, userId])

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      // Update optimistically
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    },
    [supabase, userId]
  )

  return { notifs, unreadCount, loadError, markAllRead, markRead }
}
