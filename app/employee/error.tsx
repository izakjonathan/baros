"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="employee-page"><p className="eyebrow">Something went wrong</p><h1>Couldn’t load this page</h1><p className="employee-lead">Check your connection and try again.</p><button className="primary" onClick={reset}>Try again</button></div>}
