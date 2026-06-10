'use client'

import { useState, useEffect, useRef } from 'react'
import { timeAgo, useNotifications } from '@/hooks/useNotifications'
import Link from 'next/link'

export default function NotificationBell({ userId }: { userId: string | null | undefined }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Call hooks unconditionally
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

  if (!userId) return null; // Early return MUST be after all hooks

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open && unreadCount > 0) markAllRead()
        }}
        className="relative flex items-center justify-center text-primary hover:text-secondary transition-colors"
        title="Notificaciones"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+16px)] right-0 w-80 lg:w-96 bg-white border border-[#EAEAEA] rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-[100]">
          {/* Triángulo superior */}
          <div className="absolute -top-2 right-[10px] w-4 h-4 bg-white border-l border-t border-[#EAEAEA] transform rotate-45 rounded-tl-[3px]" />
          
          <div className="relative bg-white rounded-xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] bg-gray-50/50">
              <span className="font-bold text-xs uppercase text-black tracking-widest">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-gray-500 font-bold uppercase tracking-wider hover:text-black transition-colors"
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#EAEAEA] bg-white">
              {notifs.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">notifications_paused</span>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sin notificaciones</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const href = n.order_id ? `/account/orders/${n.order_id}` : '#';
                  return (
                    <Link 
                      href={href}
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className={`block px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors relative group ${
                        !n.is_read ? 'bg-[#F9FAFB]' : ''
                      }`}
                    >
                      {!n.is_read && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-black"></span>
                      )}
                      <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1">{n.title}</p>
                      <p className="text-[12px] text-gray-500 leading-relaxed mb-2 pr-2">{n.body}</p>
                      <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px] mr-1">schedule</span>
                        {timeAgo(n.created_at)}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
