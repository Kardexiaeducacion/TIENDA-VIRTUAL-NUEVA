'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("PAGE ERROR CAUGHT:", error);
  }, [error]);

  return (
    <div className="p-8 text-left bg-red-50 text-red-900 min-h-screen">
      <h2 className="text-2xl font-black mb-4">Something went wrong!</h2>
      <p className="mb-2 font-bold">{error.message}</p>
      <pre className="text-xs bg-white p-4 rounded border overflow-x-auto whitespace-pre-wrap">
        {error.stack}
      </pre>
      <button
        className="mt-4 px-4 py-2 bg-black text-white rounded font-bold"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
