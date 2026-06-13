"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("QA Page Error:", error);
  }, [error]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">¡Algo salió mal en esta página!</h2>
      <div className="bg-red-50 text-red-800 p-4 rounded-md font-mono text-sm mb-4 whitespace-pre-wrap">
        {error.message}
        <br/><br/>
        {error.stack}
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded-md text-sm font-bold"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
