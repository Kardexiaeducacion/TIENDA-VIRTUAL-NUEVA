"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminHeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // If the URL has a 'q' parameter, initialize the search bar with it
    const q = searchParams?.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/editor/products?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push("/editor/products");
      }
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar artículos (presiona Enter)..." 
        className="w-full bg-[#F5F5F5] border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500"
      />
    </div>
  );
}
