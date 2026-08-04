import type { ReactNode } from "react"; import styles from "./Badge.module.css";
export function Badge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"success"|"warning"|"danger"}){return <span className={[styles.badge,tone!=="neutral"?styles[tone]:""].filter(Boolean).join(" ")}>{children}</span>}
