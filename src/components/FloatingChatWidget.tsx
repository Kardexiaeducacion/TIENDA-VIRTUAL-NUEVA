"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen && !chat) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chat) {
      fetchMessages();
      
      // Suscripción en tiempo real a los mensajes de este chat
      const channel = supabase.channel(`chat_${chat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `chat_id=eq.${chat.id}` 
        }, payload => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chat]);

  const initChat = async () => {
    setLoading(true);
    const res = await fetch("/api/chat");
    const data = await res.json();
    if (data.success) {
      setChat(data.chat);
    } else {
      if (data.error === "No autorizado") {
        alert("Debes iniciar sesión para usar el chat de soporte.");
        setIsOpen(false);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chat) return;

    const tempMsg = inputText;
    setInputText("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: chat.id,
        message: tempMsg,
        senderType: "user"
      })
    });
  };

  // No renderizar en panel de administrador ni login
  if (pathname?.startsWith("/editor") || pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <>
      {/* Botón Flotante */}
      <button
        id="chat-widget-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? "rotate-90 opacity-0 pointer-events-none" : "rotate-0 opacity-100"}`}
      >
        <span className="material-symbols-outlined text-2xl">chat</span>
      </button>

      {/* Ventana de Chat */}
      <div 
        className={`fixed bottom-6 right-6 w-[350px] h-[500px] bg-white border border-outline-variant shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm">Soporte Cloe</h3>
            <p className="text-[10px] opacity-80">Generalmente respondemos en minutos</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="material-symbols-outlined hover:text-gray-300">close</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F9F9F9] flex flex-col gap-3">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-sm text-secondary">Cargando chat...</div>
          ) : !chat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">forum</span>
              <p className="text-sm font-bold text-secondary">Inicia sesión para hablar con nosotros.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-end text-center p-4">
              <p className="text-xs text-secondary bg-white p-3 rounded-lg border border-[#EAEAEA] shadow-sm inline-block self-center mb-4">
                ¡Hola! 👋 Soy un asesor de Cloe. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.sender_type === "user";
              return (
                <div key={msg.id} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isUser ? "bg-primary text-white self-end rounded-tr-sm" : "bg-white border border-[#EAEAEA] text-black self-start rounded-tl-sm shadow-sm"}`}>
                  <p>{msg.message}</p>
                  <span className={`text-[9px] block mt-1 ${isUser ? "text-white/70 text-right" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {chat && (
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-outline-variant flex items-center gap-2 shrink-0">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-gray-300"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        )}
      </div>
    </>
  );
}
