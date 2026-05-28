"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const questions = [
  {
    sku: "CL-9021", product: "Saffiano Tote", price: "$1,250.00",
    customer: "Eleanor Maxwell", initials: "EM", initialsStyle: "bg-secondary-container",
    time: "12 minutes ago", urgent: false,
    question: "Could you confirm if the interior laptop sleeve fits a 14-inch MacBook Pro comfortably? Also, is the base reinforced to prevent sagging over time?",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlTpvUjI7Imt91jnilJxElup7nWgDQU1m9UXpjSfbR5dB1LupPTofo8bnHFfSss62xWvAPaNHRZgLxNfRx1b5NjSftZ9sdudSBNRHTg-3sITymyK64CByX1wynOk7tu608KPRs_yv01Bk9582NhzlGkJVBdZ-Hxn06xA2wDmpGeZdgxXJrL1WHt1_LIuRYnW5V5H3tIMFyTV9fzkq3NCHy_L09mPOZqJD23brHvwm_iACyXC8-G1XjT6zGk7D1TPWGBSlUOrv-GExm",
  },
  {
    sku: "CL-SN-02", product: "Aeon Knit Runner", price: "$280.00",
    customer: "Julian Knight", initials: "JK", initialsStyle: "bg-surface-container-highest",
    time: "2 hours ago", urgent: false,
    question: "I'm usually a size 10.5 in most brands. Do these run true to size or should I size up for a better performance fit?",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhOkGJRfmyRJ_-pIvRTIOuOsjmq1qqNk0b60NSsASZQxvTBGgZD5HbALFL1IE-hJEvkp5VK3J6rcXXvG7j3PbSQmQrSoNvH3I08dgQ7egJ1hfuGpLbiRYC4QvnNzmAufJ0lEm1UU_mn9JZjoY-i8uNZNo_Ve-i2_yJE4HW-BKwr9VTYeOdMY3mQJXVCD-r8C0z9wb4BBwQYqtL4ErrQ7yiJD9-gtiDRkXRCMeXjxeweiphbBy_Tiy9amv1X-K1-CRwdGZdFIe_8bxQ",
  },
  {
    sku: "CLO-WTC-01", product: "Chronos Mesh Silver", price: "$450.00",
    customer: "Sarah Alston", initials: "SA", initialsStyle: "bg-error-container text-on-error-container",
    time: "5 hours ago", urgent: true,
    question: "Wait, the description says water resistant up to 50m but the specs say 30m. Which one is correct? I need to know before ordering for a gift today.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFQCaYTCFD1BdFTQ-JFhoF5wSxsYh4JSFhL3K2zl66xo5ehSH3qhSF2ECURvFFFPRoM6RgY37ebyxIEnbNMXzxRn8R5FU3C74vQ0GwDhRHNec5Ym0lWpdBamivB89uGVIDpCcQgCQiZe-Fb4M9Encje9_8Q0NgGx6vspeM_0-2WEncCyySlE3MzOpCZWqs9DrbaZNc2mcbjBhTnqRGz_kqnpObehSNp8KMg9gZEBOdps6OBJWPsvIZuf1we2xU_8ZfVK6KO0fI3gy5",
  },
];

const emojis = ["😊","👍","✨","🎉","💯","❤️","🙏","🤩","👏","💎","🛍️","📦","🚀","⭐","💬"];

const AdminNav = ({ active }: { active: string }) => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant flex flex-col z-50">
    <div className="px-4 py-6 mb-8">
      <h1 className="text-2xl font-extrabold text-primary">Admin Center</h1>
      <p className="text-xs text-secondary uppercase tracking-wider mt-1">Manage Cloe Store</p>
    </div>
    <nav className="flex-1 space-y-1 px-1">
      {[
        { label: "Dashboard", icon: "dashboard", href: "/editor" },
        { label: "Products", icon: "inventory_2", href: "/editor/products/new" },
        { label: "Orders", icon: "shopping_bag", href: "/editor/orders" },
        { label: "Customer Q&A", icon: "question_answer", href: "/editor/qa" },
        { label: "Settings", icon: "settings", href: "/editor/settings" },
      ].map((item) => (
        <Link key={item.label} href={item.href}
          className={`flex items-center px-4 py-3 text-sm font-semibold transition-all ${
            active === item.label ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
    <div className="p-4 mt-auto border-t border-outline-variant">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
        <div>
          <p className="text-sm font-semibold">Alex Mercer</p>
          <p className="text-xs text-secondary">Head Manager</p>
        </div>
      </div>
    </div>
  </aside>
);

export default function QAPage() {
  const [replyText, setReplyText] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  return (
    <div className="font-sans min-h-screen overflow-x-hidden bg-background text-on-background">
      <AdminNav active="Customer Q&A" />
      <main className="ml-64 min-h-screen bg-background">
        {/* HEADER */}
        <header className="h-20 bg-surface flex items-center justify-between px-20 border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Pending Inquiries</h2>
            <span className="bg-error text-on-error text-xs font-semibold px-2 py-0.5 rounded-full">12 New</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none w-64 text-sm" placeholder="Search questions..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">filter_list</button>
            </div>
          </div>
        </header>

        <section className="max-w-[1440px] px-20 py-12">
          {/* STATS */}
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-8 p-6 bg-surface-container-lowest border border-outline-variant">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">Weekly Performance</p>
              <div className="flex items-end justify-between">
                <h3 className="text-5xl font-bold text-primary">84% <span className="text-xl font-normal text-secondary ml-2">Response Rate</span></h3>
                <div className="flex gap-2 pb-4">
                  {[12, 16, 20, 14, 24].map((h, i) => (
                    <div key={i} className={`w-2 ${i === 4 ? "bg-primary" : "bg-surface-container-highest"}`} style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-4 p-6 bg-primary text-on-primary flex flex-col justify-between border border-primary">
              <div>
                <p className="text-xs font-semibold text-on-tertiary-container uppercase tracking-widest mb-1">Avg. Response Time</p>
                <h3 className="text-4xl font-bold">2.4h</h3>
              </div>
              <p className="text-xs opacity-70">15% faster than last month</p>
            </div>
          </div>

          {/* Q&A LIST */}
          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i}>
                <article
                  className={`grid grid-cols-12 gap-8 bg-surface-container-lowest p-6 border transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${
                    q.urgent ? "border-l-4 border-l-error border-y border-r border-outline-variant" : "border border-outline-variant hover:border-primary"
                  }`}
                  onClick={() => setActiveQuestion(activeQuestion === i ? null : i)}
                >
                  {/* PRODUCT */}
                  <div className="col-span-3 flex gap-4">
                    <div className="w-24 h-32 bg-surface-container-low flex-shrink-0 relative overflow-hidden border border-outline-variant">
                      <Image alt={q.product} src={q.img} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex flex-col justify-center">
                      {q.urgent && <p className="text-xs text-error uppercase font-bold tracking-tight mb-1">Urgent</p>}
                      <p className="text-xs text-secondary uppercase">{q.sku}</p>
                      <h4 className="text-sm font-semibold text-primary mt-1">{q.product}</h4>
                      <p className="text-xs text-on-surface-variant">{q.price}</p>
                    </div>
                  </div>
                  {/* QUESTION */}
                  <div className="col-span-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full ${q.initialsStyle} flex items-center justify-center text-xs font-semibold`}>{q.initials}</span>
                      <span className="text-sm font-semibold">{q.customer}</span>
                      <span className="text-secondary text-xs">• {q.time}</span>
                    </div>
                    <p className="text-base text-on-surface-variant italic">&ldquo;{q.question}&rdquo;</p>
                  </div>
                  {/* ACTIONS */}
                  <div className="col-span-3 flex items-center justify-end gap-4">
                    <button className="text-sm font-semibold text-secondary hover:text-primary transition-colors py-2 px-4" onClick={(e) => e.stopPropagation()}>Dismiss</button>
                    <button className="bg-primary text-on-primary text-sm font-semibold px-6 py-3 hover:bg-primary-container transition-all flex items-center gap-2">
                      Answer <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </article>

                {/* REPLY BOX */}
                {activeQuestion === i && (
                  <div className="bg-surface-container-lowest border border-t-0 border-outline-variant p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Your Response</p>
                    <textarea
                      className="w-full border border-outline-variant bg-surface p-4 text-base focus:outline-none focus:border-primary resize-none"
                      rows={3}
                      placeholder="Escribe tu respuesta aquí..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    {/* EMOJI KEYBOARD */}
                    <div className="flex flex-wrap gap-2 my-3">
                      {emojis.map((emoji) => (
                        <button key={emoji} className="text-xl hover:scale-125 transition-transform" type="button" onClick={() => setReplyText(prev => prev + emoji)}>{emoji}</button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button className="px-6 py-2 border border-outline text-sm font-semibold text-secondary hover:bg-surface-container transition-colors" onClick={() => setActiveQuestion(null)}>Cancelar</button>
                      <button className="px-6 py-2 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors">Publicar Respuesta</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="mt-12 pt-6 border-t border-outline-variant flex items-center justify-between">
            <p className="text-xs text-secondary">Showing 1-10 of 125 pending inquiries</p>
            <div className="flex gap-2">
              <button className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[1, 2, 3].map((n) => (
                <button key={n} className={`w-10 h-10 border flex items-center justify-center text-sm font-semibold ${n === 1 ? "border-primary bg-primary text-on-primary" : "border-outline-variant hover:bg-surface-container-high"}`}>{n}</button>
              ))}
              <button className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
