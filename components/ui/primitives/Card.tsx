import type { ReactNode } from "react";
type CardProps={children:ReactNode;density?:"default"|"compact"|"flush";className?:string};
export function Card({children,density="default",className=""}:CardProps){
  const densityClass=density==="compact"?"card-compact":density==="flush"?"card-flush":"";
  return <div className={["card",densityClass,className].filter(Boolean).join(" ")}>{children}</div>;
}
