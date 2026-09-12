import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/30 shadow-sm focus-visible:ring-blue-500',
      secondary:
        'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 shadow-sm focus-visible:ring-slate-400',
      outline:
        'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border-slate-700/80 focus-visible:ring-slate-400',
      ghost:
        'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 border-transparent focus-visible:ring-slate-400',
      danger:
        'bg-rose-600/90 hover:bg-rose-600 text-white border-rose-500/30 shadow-sm focus-visible:ring-rose-500',
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs gap-1.5 rounded',
      sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-md',
      md: 'px-3.5 py-2 text-sm font-medium gap-2 rounded-md',
      lg: 'px-4 py-2.5 text-base font-medium gap-2.5 rounded-md',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center border font-sans select-none transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
          'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
