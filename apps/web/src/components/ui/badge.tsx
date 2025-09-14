import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export function Badge({ className, variant = "default", children, ...props }: {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "class" | "origin";
  children: ReactNode;
  [key: string]: any;
}) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground border-border",
    class: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    origin: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variants[variant],
      className
    )} {...props}>
      {children}
    </div>
  )
}
