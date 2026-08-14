import type { ReactNode } from "react";
type CardProps={children:ReactNode;padding?:"sm"|"md"|"lg";tone?:"default"|"muted";elevated?:boolean;className?:string};
export function Card({children,padding="md",tone="default",elevated=false,className=""}:CardProps){return <div className={["card",`card-${padding}`,tone==="muted"?"card-muted":"",elevated?"card-elevated":"",className].filter(Boolean).join(" ")}>{children}</div>}
