"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main style={{maxWidth:560,margin:"12vh auto",padding:24,fontFamily:"system-ui,sans-serif"}}><h1>Bar Ops could not load</h1><p>Refresh the application or try again. No operation has been confirmed unless you saw a success message.</p><button type="button" onClick={reset}>Try again</button></main></body></html>;
}
