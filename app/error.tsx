"use client";
import { useEffect } from "react";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Operation page recovery", { digest: error.digest }); }, [error]);
  return <main className="login-page"><section className="card login-card"><div className="login-brand"><span>Bar</span><b>Os</b></div><h1>Something went wrong</h1><p>Your saved information was not intentionally changed.</p><button type="button" className="primary full" onClick={reset}>Try again</button></section></main>;
}
