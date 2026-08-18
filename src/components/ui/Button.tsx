import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@/lib/format';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';
  const sizes: Record<Size, string> = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-sm tracking-[0.15em] px-8 py-4',
  };
  const variants: Record<Variant, string> = {
    primary: 'bg-white text-black hover:bg-zinc-200',
    gold: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/20',
    outline: 'border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500',
    ghost: 'text-zinc-300 hover:text-white hover:bg-white/5',
    danger: 'bg-red-600/90 text-white hover:bg-red-600',
  };

  return (
    <button
      className={classNames(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
