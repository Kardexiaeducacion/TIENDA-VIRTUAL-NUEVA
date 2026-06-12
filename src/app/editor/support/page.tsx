"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminSupportChat() {
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [activeChat, setActiveChat] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchChats();
    
    // Subscribe to new chats
    const channel = supabase.channel('admin_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchChats, supabase]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);

      const channel = supabase.channel(`admin_chat_${activeChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `chat_id=eq.${activeChat.id}` 
        }, payload => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          scrollToBottom();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [activeChat, fetchMessages, supabase]);

  const fetchChats = useCallback(async () => {
    const { data } = await supabase
      .from('support_chats')
      .select('*')
      .order('last_message_at', { ascending: false });
    
    if (data) setChats(data);
    setLoadingChats(false);
  }, [supabase]);

  const fetchMessages = useCallback(async (chatId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  }, [supabase]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const tempMsg = inputText;
    setInputText("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: activeChat.id,
        message: tempMsg,
        senderType: "admin"
      })
    });
  };

  const closeChat = async (chatId: string) => {
    await supabase.from('support_chats').update({ status: 'closed' }).eq('id', chatId);
    fetchChats();
    if (activeChat?.id === chatId) setActiveChat(null);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-lg border border-[#EAEAEA] bg-white animate-in fade-in duration-500 shadow-sm">
      
      {/* SIDEBAR - CHAT LIST */}
      <div className="w-1/3 border-r border-[#EAEAEA] flex flex-col bg-[#F9F9F9]">
        <div className="p-4 border-b border-[#EAEAEA] bg-white shrink-0">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined">support_agent</span>
            Soporte en Vivo
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <p className="text-center text-sm text-gray-500 mt-4">Cargando chats...</p>
          ) : chats.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-4 italic">No hay conversaciones.</p>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`p-4 border-b border-[#EAEAEA] cursor-pointer transition-colors relative ${activeChat?.id === chat.id ? 'bg-white border-l-4 border-l-black' : 'hover:bg-[#F0F0F0]'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-sm text-black">{chat.user_name}</p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.user_email}</p>
                {chat.status === 'closed' && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm uppercase">Cerrado</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT - ACTIVE CHAT */}
      <div className="w-2/3 flex flex-col bg-[#F5F5F5]">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-[#EAEAEA] flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-black text-sm">{activeChat.user_name}</h3>
                <p className="text-xs text-gray-500">{activeChat.user_email}</p>
              </div>
              {activeChat.status !== 'closed' && (
                <button onClick={() => closeChat(activeChat.id)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-sm uppercase">
                  Cerrar Ticket
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {messages.map(msg => {
                const isAdmin = msg.sender_type === "admin";
                return (
                  <div key={msg.id} className={`max-w-[70%] rounded-xl px-4 py-2 text-sm shadow-sm ${isAdmin ? "bg-black text-white self-end rounded-tr-sm" : "bg-white text-black border border-[#EAEAEA] self-start rounded-tl-sm"}`}>
                    <p>{msg.message}</p>
                    <span className={`text-[9px] block mt-1 ${isAdmin ? "text-gray-400 text-right" : "text-gray-400"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-[#EAEAEA] shrink-0">
              {activeChat.status === 'closed' ? (
                <p className="text-center text-sm text-gray-500 italic py-2">Este chat ha sido cerrado.</p>
              ) : (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 bg-[#F9F9F9] border border-[#EAEAEA] rounded-md px-4 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-6 py-2 bg-black text-white rounded-md text-sm font-bold uppercase disabled:opacity-50 transition-opacity flex items-center gap-2"
                  >
                    <span>Enviar</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">forum</span>
            <p className="text-sm font-bold">Selecciona una conversación para comenzar</p>
          </div>
        )}
      </div>

    </div>
  );
}
