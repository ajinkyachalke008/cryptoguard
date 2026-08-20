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
      <body className="min-h-screen bg-[#05060a] text-white flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-md w-full rounded-2xl border border-yellow-500/30 bg-black/90 backdrop-blur-xl p-8 text-center shadow-[0_0_40px_#ffd70033] my-8">
          <h2 className="text-2xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent">
            System Notice
          </h2>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            The scanner encountered an unexpected interruption. You can retry the operation or go back home.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="h-11 rounded-full bg-yellow-500 px-6 font-semibold text-black shadow-[0_0_20px_#ffd70080] transition-transform hover:scale-[1.03] hover:bg-yellow-400"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="h-11 rounded-full border border-yellow-500/60 px-6 font-semibold text-yellow-300 shadow-[0_0_16px_#ffd70040] transition-transform hover:scale-[1.03] hover:text-yellow-200 hover:border-yellow-400 hover:bg-yellow-500/10"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}