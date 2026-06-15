import { cloneElement, isValidElement, type ReactElement } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const variantClasses = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-background",
  ghost:
    "text-muted hover:text-foreground hover:bg-foreground/[0.06]",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface",
};

const sizeClasses = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export function buttonClassName(
  variant: ButtonProps["variant"] = "primary",
  size: ButtonProps["size"] = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    variantClasses[variant ?? "primary"],
    sizeClasses[size ?? "md"],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className);

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error("Button with asChild expects a single child element.");
    }
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
