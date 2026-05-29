"use client";
import { useState } from "react";
import Image from "next/image";

const questions = [
  {
    product: "Cloe Medium Tote Bag - Monogram",
    price: "$2,899.00",
    img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&auto=format&fit=crop&q=60",
    customer: "María Gómez",
    question: "Tienen meses sin intereses con tarjetas Banamex?",
    time: "2h ago",
    urgent: true,
    initials: "MG",
    initialsStyle: "bg-blue-100 text-blue-800"
  },
  {
    product: "Quilted Crossbody Leather",
    price: "$3,499.00",
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60",
    customer: "Fernanda López",
    question: "El material interior de qué es?",
    time: "5h ago",
    urgent: false,
    initials: "FL",
    initialsStyle: "bg-purple-100 text-purple-800"
  }
];

const emojis = ["😊","👍","✨","🎉","💯","❤️","🙏","🤩","👏","💎","🛍️","📦","🚀","⭐","💬"];

export default function QAPanel() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Preguntas y Respuestas</h1>
          <p className="text-gray-500 text-sm">Responde las inquietudes de tus clientes para aumentar conversiones.</p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i}>
            <article 
              className={`grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 border transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer rounded-lg ${
                q.urgent ? "border-l-4 border-l-red-500 border-y border-r border-[#EAEAEA]" : "border border-[#EAEAEA] hover:border-black"
              }`}
              onClick={() => setSelectedChat(selectedChat === i ? null : i)}
            >
              <div className="col-span-3 flex gap-4">
                <div className="w-20 h-24 bg-gray-100 flex-shrink-0 relative overflow-hidden border border-[#EAEAEA] rounded-md">
                  <Image alt={q.product} src={q.img} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black line-clamp-2">{q.product}</p>
                  <p className="text-xs text-gray-500">{q.price}</p>
                </div>
              </div>
              <div className="col-span-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 rounded-full ${q.initialsStyle} flex items-center justify-center text-xs font-semibold`}>{q.initials}</span>
                  <p className="text-xs font-bold text-gray-500">{q.customer} <span className="font-normal opacity-70">• {q.time}</span></p>
                </div>
                <p className="text-base text-gray-700 italic">&ldquo;{q.question}&rdquo;</p>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-4">
                <button className="text-sm font-semibold text-gray-400 hover:text-black transition-colors py-2 px-4" onClick={(e) => e.stopPropagation()}>Ignorar</button>
                <button className="bg-[#1C1C1C] text-white text-xs font-bold px-6 py-3 rounded-md hover:bg-black transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">reply</span> Responder
                </button>
              </div>
            </article>

            {selectedChat === i && (
              <div className="bg-white border border-t-0 border-[#EAEAEA] p-6 rounded-b-lg -mt-2 shadow-sm relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">Tu Respuesta</p>
                <textarea
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none min-h-[100px] resize-none"
                  placeholder="Escribe aquí tu respuesta para el cliente..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 my-3">
                  {emojis.map((emoji) => (
                    <button key={emoji} className="text-xl hover:scale-125 transition-transform" type="button" onClick={() => setReplyText(prev => prev + emoji)}>{emoji}</button>
                  ))}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button className="px-6 py-2 border border-[#EAEAEA] rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors" onClick={() => setSelectedChat(null)}>Cancelar</button>
                  <button className="px-6 py-2 bg-[#1C1C1C] text-white rounded-md text-sm font-bold hover:bg-black transition-colors">Publicar Respuesta</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
