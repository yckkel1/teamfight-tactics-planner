import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export function Card({ className, children, ...props }: {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow", className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
}
