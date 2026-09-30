import Link from "next/link";

export default function NotFound() {
  return <main className="login-page"><section className="card login-card"><div className="login-brand"><span>Bar</span><b>Os</b></div><h1>Page not found</h1><p>This address is not part of Operation.</p><Link className="primary full" href="/operation">Open Operation</Link></section></main>;
}
