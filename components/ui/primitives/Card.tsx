import type { ReactNode } from "react"; import styles from "./Card.module.css";
type CardProps={children:ReactNode;padding?:"sm"|"md"|"lg";tone?:"default"|"muted";elevated?:boolean;className?:string};
export function Card({children,padding="md",tone="default",elevated=false,className=""}:CardProps){return <div className={[styles.card,styles[padding],tone==="muted"?styles.muted:"",elevated?styles.elevated:"",className].filter(Boolean).join(" ")}>{children}</div>}
