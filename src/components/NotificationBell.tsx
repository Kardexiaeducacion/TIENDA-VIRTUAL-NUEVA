'use client'

import { useState, useEffect, useRef } from 'react'
import { timeAgo, useNotifications } from '@/hooks/useNotifications'
import Link from 'next/link'

export default function NotificationBell({ userId }: { userId: string | null | undefined }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // If no userId, we still call hook but it returns empty. It's safe.
  const { notifs, unreadCount, markAllRead, markRead } = useNotifications(userId, 20, 'bell')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!userId) return null; // Don't render the bell if the user is not logged in

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open && unreadCount > 0) markAllRead()
        }}
        className="relative hover:text-secondary transition-colors"
        title="Notificaciones"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-surface border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
            <span className="font-semibold text-xs uppercase text-primary tracking-wider">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-secondary font-semibold uppercase hover:underline"
              >
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
            {notifs.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-3xl text-outline mb-2">notifications_none</span>
                <p className="text-xs text-secondary">Sin notificaciones</p>
              </div>
            ) : (
              notifs.map((n) => {
                const href = n.order_id ? `/account/orders/${n.order_id}` : '#';
                return (
                  <Link 
                    href={href}
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`block px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${
                      !n.is_read ? 'bg-primary/5 border-l-2 border-primary' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-primary leading-tight">{n.title}</p>
                    <p className="text-xs text-secondary mt-1 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-outline mt-2">{timeAgo(n.created_at)}</p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
