"use client";

// Minimal global error boundary without debug details
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-yellow-500/30 bg-black/40 backdrop-blur p-6 text-center shadow-[0_0_24px_#ffd70033]">
          <h2 className="text-xl font-semibold text-primary drop-shadow-[0_0_12px_#ffd70066]">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="h-10 rounded-full bg-yellow-500/95 px-5 text-black shadow-[0_0_16px_#ffd70080] transition-transform hover:scale-[1.03] hover:bg-yellow-400"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="h-10 rounded-full border border-yellow-500/60 px-5 text-yellow-300 shadow-[0_0_16px_#ffd70040] transition-transform hover:scale-[1.03] hover:text-yellow-200 hover:border-yellow-400"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}