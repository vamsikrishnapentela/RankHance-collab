import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  leftIcon, 
  rightIcon, 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const base = 'font-bold rounded-2xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20',
    secondary: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[var(--color-primary)]',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-14 px-6 text-base',
    lg: 'h-16 px-8 text-lg',
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} flex items-center justify-center gap-2 ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

Button.LeftIcon = ({ children, ...props }) => <span {...props}>{children}</span>;
Button.RightIcon = ({ children, ...props }) => <span {...props}>{children}</span>;

export default Button;

